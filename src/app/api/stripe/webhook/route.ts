import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

  const supabase = await createClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.supabase_user_id;

    if (!userId || !session.subscription) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    // Fetch the subscription to get interval and expiry
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    ) as unknown as Stripe.Subscription;

    const priceInterval = subscription.items.data[0]?.plan?.interval ?? 'month';
    const expiresAt = new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString();

    await supabase
      .from('profiles')
      .update({
        plan: 'pro',
        stripe_subscription_id: subscription.id,
        plan_interval: priceInterval,
        plan_expires_at: expiresAt,
      })
      .eq('id', userId);

    console.log(`[stripe webhook] upgraded user ${userId} to pro (${priceInterval})`);
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    // Find user by stripe_customer_id
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
    // Renewal — extend expiry date
    const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
    const subscriptionId = invoice.subscription;

    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId) as unknown as Stripe.Subscription & { current_period_end: number };
      const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
      const customerId = subscription.customer as string;

      await supabase
        .from('profiles')
        .update({ plan_expires_at: expiresAt })
        .eq('stripe_customer_id', customerId);
    }
  }

  return NextResponse.json({ received: true });
}
