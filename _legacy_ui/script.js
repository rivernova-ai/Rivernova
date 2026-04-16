let currentView = 'signin';

// Supabase Configuration
const SUPABASE_URL = 'https://nmeitgxujataiktevouk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tZWl0Z3h1amF0YWlrdGV2b3VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NTg5MzEsImV4cCI6MjA5MTMzNDkzMX0.BQxSAoX93BEBkg3qPqPEndSqNfy8I50KKviX7mze_xM';

// ========================================
//  UI INTERACTIONS
// ========================================

function openForm() {
    document.getElementById('authModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    showSignIn();
}

function closeForm() {
    document.getElementById('authModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showSignIn() {
    currentView = 'signin';
    document.getElementById('signinForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('signinTab').classList.add('active');
    document.getElementById('signupTab').classList.remove('active');
}

function showSignUp() {
    currentView = 'signup';
    document.getElementById('signinForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('signinTab').classList.remove('active');
    document.getElementById('signupTab').classList.add('active');
}

// ========================================
//  SCROLL REVEAL ANIMATION
// ========================================

function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    reveals.forEach((el) => observer.observe(el));
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
//  STAT COUNTER ANIMATION
// ========================================

function initCounterAnimation() {
    const statNumbers = document.querySelectorAll('.stat-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const text = el.textContent.trim();

                // Only animate numeric values
                const numMatch = text.match(/^(\d+)(%?)$/);
                if (numMatch) {
                    const target = parseInt(numMatch[1], 10);
                    const suffix = numMatch[2] || '';
                    animateCounter(el, 0, target, suffix, 1200);
                }

                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach((el) => observer.observe(el));
}

function animateCounter(el, start, end, suffix, duration) {
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * eased);

        el.textContent = current + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ========================================
//  AUTH FUNCTIONS
// ========================================

async function signInWithEmail(event) {
    event.preventDefault();
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    const submitBtn = document.getElementById('signin-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Sign in successful:', data);
            localStorage.setItem('supabase_token', data.access_token);
            if (data.refresh_token) {
                localStorage.setItem('supabase_refresh_token', data.refresh_token);
            }
            localStorage.setItem('user_email', email);
            localStorage.setItem('login_time', new Date().toISOString());

            showToast('Successfully signed in!', 'success');
            closeForm();
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
        } else {
            if (data.error_description) {
                if (data.error_description.includes('Invalid login credentials')) {
                    showToast('Invalid email or password. Please try again.', 'error');
                } else if (data.error_description.includes('Email not confirmed')) {
                    showToast('Please verify your email before signing in.', 'warning');
                } else {
                    showToast('Sign in failed: ' + data.error_description, 'error');
                }
            } else {
                showToast('Sign in failed. Please check your credentials.', 'error');
            }
        }
    } catch (error) {
        console.error('Sign in error:', error);
        showToast('An error occurred. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
    }
}

async function signUpWithEmail(event) {
    event.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (!name || !email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (name.length < 2) {
        showToast('Please enter a valid name', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }

    const submitBtn = document.getElementById('signup-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
                email: email,
                password: password,
                options: {
                    data: { full_name: name }
                }
            })
        });

        const data = await response.json();

        if (response.ok && data.user) {
            console.log('Sign up successful:', data);

            if (data.access_token) {
                localStorage.setItem('supabase_token', data.access_token);
                if (data.refresh_token) {
                    localStorage.setItem('supabase_refresh_token', data.refresh_token);
                }
                localStorage.setItem('user_email', email);
                localStorage.setItem('login_time', new Date().toISOString());

                showToast('Account created! Welcome to Rivernova!', 'success');
                closeForm();
                setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
            } else {
                // Email confirmation required — switch to sign-in tab but keep modal open
                showSignIn();
                showToast('Account created! Check your email to verify, then sign in.', 'success');
            }
        } else {
            const errorMsg = data.msg || data.error_description || data.error || 'Unknown error';

            if (errorMsg.toLowerCase().includes('already') || errorMsg.toLowerCase().includes('exists') || errorMsg.toLowerCase().includes('registered')) {
                showToast('This email is already registered. Please sign in.', 'warning');
                showSignIn();
                document.getElementById('signin-email').value = email;
            } else if (errorMsg.toLowerCase().includes('rate limit') || errorMsg.toLowerCase().includes('too many')) {
                showToast('Too many attempts. Please wait and try again.', 'warning');
            } else if (errorMsg.toLowerCase().includes('invalid email')) {
                showToast('Invalid email format.', 'error');
            } else if (errorMsg.toLowerCase().includes('weak password') || errorMsg.toLowerCase().includes('password')) {
                showToast('Password is too weak. Use at least 6 characters.', 'error');
            } else {
                showToast('Sign up failed: ' + errorMsg, 'error');
            }
        }
    } catch (error) {
        console.error('Sign up error:', error);
        showToast('An error occurred. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
    }
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function signInWithGmail() {
    if (window.location.protocol === 'file:') {
        showToast('Please run this on a local server for Google Sign-In.', 'warning');
        return;
    }

    localStorage.setItem('oauth_attempt_time', new Date().toISOString());

    const redirectUrl = window.location.origin + '/index.html';
    const authUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;

    window.location.href = authUrl;
}

// ========================================
//  TOAST NOTIFICATION SYSTEM
// ========================================

function showToast(message, type = 'info') {
    // Remove existing toasts
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

    // Inject toast styles if not already present
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
            .toast-exit {
                animation: toastOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
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
//  HANDLE OAUTH CALLBACK & SESSION
// ========================================

window.addEventListener('load', () => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken) {
            localStorage.setItem('supabase_token', accessToken);
            if (refreshToken) {
                localStorage.setItem('supabase_refresh_token', refreshToken);
            }
            localStorage.setItem('login_time', new Date().toISOString());
            localStorage.setItem('auth_method', 'google');

            console.log('OAuth successful');
            window.history.replaceState({}, document.title, window.location.pathname);
            window.location.href = 'dashboard.html';
        }
    } else if (hash && hash.includes('error')) {
        const params = new URLSearchParams(hash.substring(1));
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        console.error('OAuth error:', error, errorDescription);

        if (errorDescription && errorDescription.includes('already registered')) {
            showToast('This Google account is already registered. Please sign in.', 'warning');
        } else {
            showToast('Authentication failed. Please try again.', 'error');
        }

        window.history.replaceState({}, document.title, window.location.pathname);
    }

    checkExistingSession();

    // Initialize UI features
    initScrollReveal();
    initNavbarScroll();
    initCounterAnimation();
});

// Refresh the access token using the stored refresh token
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

// Check for existing session and refresh token if needed
async function checkExistingSession() {
    const token = localStorage.getItem('supabase_token');
    const refreshToken = localStorage.getItem('supabase_refresh_token');

    if (!token) return;

    // Try to verify the current token
    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': SUPABASE_ANON_KEY
            }
        });

        if (response.ok) {
            console.log('Active session found');
            return;
        }
    } catch (e) {
        // Token check failed, try refresh
    }

    // Token is invalid — try refreshing
    if (refreshToken) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            console.log('Session restored via refresh token');
            return;
        }
    }

    // Both failed — clear session
    localStorage.removeItem('supabase_token');
    localStorage.removeItem('supabase_refresh_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('login_time');
    console.log('Session expired and could not be refreshed');
}

// Close modal on backdrop click
window.addEventListener('click', (event) => {
    const modal = document.getElementById('authModal');
    if (event.target === modal) {
        closeForm();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('authModal');
        if (modal && modal.style.display === 'block') {
            closeForm();
        }
    }
});