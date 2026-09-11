import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Service role client — bypasses RLS so webhooks can update any profile
function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('[stripe webhook] signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = getAdminSupabase();

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;

      if (!userId || !session.subscription) {
        console.warn('[stripe webhook] checkout.session.completed missing userId or subscription', { userId, subscription: session.subscription });
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      const priceInterval = subscription.items.data[0]?.plan?.interval ?? 'month';
      const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;
      const expiresAt = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;

      const { error } = await supabase
        .from('profiles')
        .update({
          plan: 'pro',
          stripe_subscription_id: subscription.id,
          plan_interval: priceInterval,
          plan_expires_at: expiresAt,
        })
        .eq('id', userId);

      if (error) {
        console.error('[stripe webhook] failed to update profile', error);
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
      }

      console.log(`[stripe webhook] upgraded user ${userId} to pro (${priceInterval})`);
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            plan: 'free',
            stripe_subscription_id: null,
            plan_interval: null,
            plan_expires_at: null,
          })
          .eq('id', profile.id);

        console.log(`[stripe webhook] downgraded user ${profile.id} to free`);
      }
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
      const subscriptionId = invoice.subscription;

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;
        const expiresAt = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;
        const customerId = subscription.customer as string;

        if (expiresAt) {
          await supabase
            .from('profiles')
            .update({ plan_expires_at: expiresAt })
            .eq('stripe_customer_id', customerId);
        }
      }
    }
  } catch (err) {
    console.error('[stripe webhook] unhandled error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
