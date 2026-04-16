// Supabase Configuration
const SUPABASE_URL = 'https://nmeitgxujataiktevouk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tZWl0Z3h1amF0YWlrdGV2b3VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NTg5MzEsImV4cCI6MjA5MTMzNDkzMX0.BQxSAoX93BEBkg3qPqPEndSqNfy8I50KKviX7mze_xM';

// ========================================
//  TOAST NOTIFICATION (shared with script.js)
// ========================================

function showToast(message, type = 'info') {
    const existing = document.querySelectorAll('.toast');
    existing.forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
    `;

    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast {
                position: fixed;
                top: 24px;
                right: 24px;
                z-index: 100000;
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 1rem 1.5rem;
                border-radius: 14px;
                font-family: 'Inter', sans-serif;
                font-size: 0.9rem;
                font-weight: 500;
                color: #fff;
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255,255,255,0.1);
                box-shadow: 0 16px 48px rgba(0,0,0,0.4);
                animation: toastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                max-width: 380px;
            }
            .toast-success { background: rgba(16, 185, 129, 0.9); }
            .toast-error { background: rgba(239, 68, 68, 0.9); }
            .toast-warning { background: rgba(245, 158, 11, 0.9); }
            .toast-info { background: rgba(99, 102, 241, 0.9); }
            .toast-icon {
                font-size: 1.1rem;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255,255,255,0.2);
                border-radius: 6px;
                flex-shrink: 0;
            }
            .toast-message { line-height: 1.4; }
            .toast-exit { animation: toastOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            @keyframes toastIn {
                from { transform: translateX(100px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes toastOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ========================================
//  NAVBAR SCROLL EFFECT
// ========================================

function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    });
}

// ========================================
//  TOKEN REFRESH
// ========================================

async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('supabase_refresh_token');
    if (!refreshToken) return false;

    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('supabase_token', data.access_token);
            if (data.refresh_token) {
                localStorage.setItem('supabase_refresh_token', data.refresh_token);
            }
            localStorage.setItem('login_time', new Date().toISOString());
            console.log('Token refreshed successfully');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Token refresh error:', error);
        return false;
    }
}

// ========================================
//  AUTH CHECK & USER DATA
// ========================================

window.addEventListener('load', async () => {
    let token = localStorage.getItem('supabase_token');

    if (!token) {
        showToast('Please sign in to access your account', 'warning');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return;
    }

    let isValid = await verifyToken(token);

    // If token expired, try refreshing it
    if (!isValid) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            token = localStorage.getItem('supabase_token');
            isValid = true;
        }
    }

    if (!isValid) {
        clearUserSession();
        showToast('Session expired. Please sign in again.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return;
    }

    await loadUserData(token);
    await checkApplicationStatus(token);
    initNavbarScroll();
});

async function verifyToken(token) {
    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': SUPABASE_ANON_KEY
            }
        });

        return response.ok;
    } catch (error) {
        console.error('Token verification error:', error);
        return false;
    }
}

async function loadUserData(token) {
    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': SUPABASE_ANON_KEY
            }
        });

        if (response.ok) {
            const user = await response.json();
            console.log('User data:', user);

            const userName = user.user_metadata?.full_name || user.email.split('@')[0];
            const userEmail = user.email;
            const accountType = user.app_metadata?.provider === 'google' ? 'Google' : 'Email';

            document.getElementById('userName').textContent = userName;
            document.getElementById('userEmail').textContent = userEmail;
            document.getElementById('accountType').textContent = accountType;

            localStorage.setItem('user_email', userEmail);
            localStorage.setItem('user_name', userName);
        } else {
            console.error('Failed to load user data');
            clearUserSession();
            showToast('Session expired. Please sign in again.', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showToast('Error loading account data. Please try again.', 'error');
        clearUserSession();
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

function clearUserSession() {
    localStorage.removeItem('supabase_token');
    localStorage.removeItem('supabase_refresh_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('login_time');
    localStorage.removeItem('auth_method');
}

function signOut() {
    clearUserSession();
    showToast('Successfully signed out!', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// ========================================
//  APPLICATION STATUS CHECK
// ========================================

async function checkApplicationStatus(token) {
    const card = document.getElementById('card-applications');
    if (!card) return;

    const cardTitle = card.querySelector('h3');
    const cardDesc = card.querySelector('p');
    const cardBtn = card.querySelector('.dashboard-btn');

    let hasApplication = false;

    // Check Supabase first
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/applications?select=*&order=submitted_at.desc&limit=1`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${token}`,
            }
        });

        if (response.ok) {
            const apps = await response.json();
            if (apps && apps.length > 0) {
                hasApplication = true;
                updateCardWithApplication(card, cardTitle, cardDesc, cardBtn, apps[0]);
                return;
            }
        }
    } catch (error) {
        console.log('Could not check Supabase applications:', error);
    }

    // Fallback: check localStorage
    const localApp = localStorage.getItem('rivernova_application');
    if (localApp) {
        hasApplication = true;
        try {
            const appData = JSON.parse(localApp);
            updateCardWithApplication(card, cardTitle, cardDesc, cardBtn, appData);
            return;
        } catch (e) {
            console.error('Error parsing local application:', e);
        }
    }

    // No applications found — show "Submit An Application"
    if (!hasApplication) {
        // Update icon to a plus/edit icon
        const cardIcon = card.querySelector('.card-icon');
        cardIcon.innerHTML = `
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
        `;

        cardTitle.textContent = 'Submit An Application';
        cardDesc.textContent = 'Start your education journey today';
        cardBtn.textContent = 'Start Application';
        cardBtn.id = 'btn-start-application';
        cardBtn.onclick = () => {
            window.location.href = 'application.html';
        };
    }
}

function updateCardWithApplication(card, cardTitle, cardDesc, cardBtn, appData) {
    cardTitle.textContent = 'My Application';

    // Show submission status
    const status = appData.status || 'submitted';
    const statusLabels = {
        submitted: '📋 Submitted',
        reviewing: '🔍 Under Review',
        completed: '✅ Completed'
    };

    cardDesc.innerHTML = `
        <span style="display:block; margin-bottom:0.3rem;">
            ${statusLabels[status] || statusLabels.submitted}
        </span>
        <span style="font-size: 0.82rem; color: var(--text-tertiary);">
            ${appData.field_of_study || ''} · ${appData.country || ''}
        </span>
    `;

    cardBtn.textContent = 'View Application';
    cardBtn.onclick = () => {
        showToast('Application details coming soon!', 'info');
    };
}
