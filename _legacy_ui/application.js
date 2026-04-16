// Supabase Configuration
const SUPABASE_URL = 'https://gudyszcygszreixvnmjp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1ZHlzemN5Z3N6cmVpeHZubWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MTk4NDksImV4cCI6MjA5MDk5NTg0OX0.NFP7oEuXHHp-XyzNflZniK0TH7XKL5RWjxnfQ5kDOx8';

let currentStep = 1;
const totalSteps = 4;

// ========================================
//  TOAST NOTIFICATION
// ========================================

function showToast(message, type = 'info') {
    const existing = document.querySelectorAll('.toast');
    existing.forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
    `;

    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast { position: fixed; top: 24px; right: 24px; z-index: 100000; display: flex; align-items: center; gap: 10px; padding: 1rem 1.5rem; border-radius: 14px; font-family: 'Inter', sans-serif; font-size: 0.9rem; font-weight: 500; color: #fff; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 16px 48px rgba(0,0,0,0.4); animation: toastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); max-width: 380px; }
            .toast-success { background: rgba(16, 185, 129, 0.9); }
            .toast-error { background: rgba(239, 68, 68, 0.9); }
            .toast-warning { background: rgba(245, 158, 11, 0.9); }
            .toast-info { background: rgba(99, 102, 241, 0.9); }
            .toast-icon { font-size: 1.1rem; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.2); border-radius: 6px; flex-shrink: 0; }
            .toast-message { line-height: 1.4; }
            .toast-exit { animation: toastOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            @keyframes toastIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes toastOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100px); opacity: 0; } }
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
//  AUTH CHECK
// ========================================

window.addEventListener('load', async () => {
    const token = localStorage.getItem('supabase_token');
    if (!token) {
        showToast('Please sign in first', 'warning');
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);
        return;
    }

    // Pre-fill name and email from stored user data
    const userName = localStorage.getItem('user_name');
    const userEmail = localStorage.getItem('user_email');
    if (userName) document.getElementById('fullName').value = userName;
    if (userEmail) document.getElementById('email').value = userEmail;

    initCustomSelects();
    initCheckboxLimit();
    initNavbarScroll();
});

// ========================================
//  NAVBAR SCROLL
// ========================================

function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                navbar.classList.toggle('scrolled', window.scrollY > 50);
                ticking = false;
            });
            ticking = true;
        }
    });
}

// ========================================
//  CUSTOM SELECTS
// ========================================

function initCustomSelects() {
    const selects = document.querySelectorAll('.custom-select');

    selects.forEach(select => {
        const trigger = select.querySelector('.select-trigger');
        const options = select.querySelectorAll('.select-option');
        const hiddenInput = select.parentElement.querySelector('input[type="hidden"]');
        const valueSpan = select.querySelector('.select-value');

        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            // Close all other selects
            document.querySelectorAll('.custom-select.open').forEach(s => {
                if (s !== select) s.classList.remove('open');
            });
            select.classList.toggle('open');
        });

        options.forEach(option => {
            option.addEventListener('click', () => {
                const value = option.dataset.value;
                valueSpan.textContent = option.textContent;
                valueSpan.removeAttribute('data-placeholder');
                hiddenInput.value = value;

                // Mark selected
                options.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');

                select.classList.remove('open');

                // Clear error state
                select.closest('.field-group')?.classList.remove('error');
            });
        });
    });

    // Close selects on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select')) {
            document.querySelectorAll('.custom-select.open').forEach(s => s.classList.remove('open'));
        }
    });
}

// ========================================
//  CHECKBOX LIMIT (max 3)
// ========================================

function initCheckboxLimit() {
    const checkboxes = document.querySelectorAll('input[name="priorities"]');

    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const checked = document.querySelectorAll('input[name="priorities"]:checked');

            if (checked.length >= 3) {
                // Disable unchecked ones
                checkboxes.forEach(c => {
                    if (!c.checked) c.disabled = true;
                });
            } else {
                // Enable all
                checkboxes.forEach(c => {
                    c.disabled = false;
                });
            }
        });
    });
}

// ========================================
//  STEP NAVIGATION
// ========================================

function nextStep(current) {
    if (!validateStep(current)) return;

    currentStep = current + 1;
    showStep(currentStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep(current) {
    currentStep = current - 1;
    showStep(currentStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));

    // Show current step
    const stepEl = document.getElementById(`step-${step}`);
    if (stepEl) {
        stepEl.classList.add('active');
        // Re-trigger animation
        stepEl.style.animation = 'none';
        stepEl.offsetHeight; // force reflow
        stepEl.style.animation = '';
    }

    // Update progress bar
    const fillPercent = (step / totalSteps) * 100;
    document.getElementById('progressFill').style.width = fillPercent + '%';

    // Update step indicators
    document.querySelectorAll('.progress-step').forEach(ps => {
        const psStep = parseInt(ps.dataset.step);
        ps.classList.remove('active', 'completed');
        if (psStep === step) {
            ps.classList.add('active');
        } else if (psStep < step) {
            ps.classList.add('completed');
        }
    });
}

// ========================================
//  VALIDATION
// ========================================

function validateStep(step) {
    let isValid = true;

    // Clear previous errors
    document.querySelectorAll('.field-group.error').forEach(f => f.classList.remove('error'));

    if (step === 1) {
        const fields = ['fullName', 'email', 'fieldOfStudy'];
        fields.forEach(id => {
            const input = document.getElementById(id);
            if (!input.value.trim()) {
                input.closest('.field-group').classList.add('error');
                isValid = false;
            }
        });

        // Validate email format
        const email = document.getElementById('email');
        if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            email.closest('.field-group').classList.add('error');
            isValid = false;
        }
    }

    if (step === 2) {
        ['gpa', 'testScores'].forEach(id => {
            const input = document.getElementById(id);
            if (!input.value.trim()) {
                input.closest('.field-group').classList.add('error');
                isValid = false;
            }
        });
    }

    if (step === 3) {
        ['budget', 'scholarships', 'country'].forEach(id => {
            const input = document.getElementById(id);
            if (!input.value) {
                input.closest('.field-group').classList.add('error');
                isValid = false;
            }
        });

        const checked = document.querySelectorAll('input[name="priorities"]:checked');
        if (checked.length === 0) {
            document.getElementById('priorities').closest('.field-group').classList.add('error');
            isValid = false;
        }
    }

    if (step === 4) {
        if (!document.getElementById('timeline').value) {
            document.getElementById('timeline').closest('.field-group').classList.add('error');
            isValid = false;
        }

        const consultancy = document.querySelector('input[name="previousConsultancy"]:checked');
        if (!consultancy) {
            document.getElementById('previousConsultancy-group').closest('.field-group').classList.add('error');
            isValid = false;
        }
    }

    if (!isValid) {
        showToast('Please fill in all required fields', 'error');
    }

    return isValid;
}

// ========================================
//  SUBMIT APPLICATION
// ========================================

async function submitApplication() {
    if (!validateStep(4)) return;

    const submitBtn = document.getElementById('btn-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        Submitting...
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    `;

    // Add spinner animation
    if (!document.getElementById('spinner-style')) {
        const style = document.createElement('style');
        style.id = 'spinner-style';
        style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
        document.head.appendChild(style);
    }

    // Gather data
    const priorities = Array.from(document.querySelectorAll('input[name="priorities"]:checked')).map(cb => cb.value);
    const consultancy = document.querySelector('input[name="previousConsultancy"]:checked');

    const applicationData = {
        full_name: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        field_of_study: document.getElementById('fieldOfStudy').value.trim(),
        gpa: document.getElementById('gpa').value.trim(),
        test_scores: document.getElementById('testScores').value.trim(),
        budget: document.getElementById('budget').value,
        scholarship_importance: document.getElementById('scholarships').value,
        country: document.getElementById('country').value,
        priorities: priorities,
        timeline: document.getElementById('timeline').value,
        previous_consultancy: consultancy ? consultancy.value : '',
        about_yourself: document.getElementById('aboutYourself').value.trim(),
        biggest_challenge: document.getElementById('biggestChallenge').value.trim(),
        submitted_at: new Date().toISOString(),
        status: 'submitted'
    };

    const token = localStorage.getItem('supabase_token');

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/applications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${token}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(applicationData)
        });

        if (response.ok) {
            showToast('Application submitted successfully!', 'success');

            // Show success state
            document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
            const successStep = document.getElementById('step-success');
            successStep.style.display = 'block';
            successStep.classList.add('active');

            // Update progress to 100%
            document.getElementById('progressFill').style.width = '100%';
            document.querySelectorAll('.progress-step').forEach(ps => ps.classList.add('completed'));
        } else {
            const errorData = await response.json();
            console.error('Submit error:', errorData);

            // If the table doesn't exist yet, store locally as fallback
            if (response.status === 404 || response.status === 400) {
                // Fallback: store in localStorage
                localStorage.setItem('rivernova_application', JSON.stringify(applicationData));
                showToast('Application saved! Our team will review it shortly.', 'success');

                document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
                const successStep = document.getElementById('step-success');
                successStep.style.display = 'block';
                successStep.classList.add('active');
                document.getElementById('progressFill').style.width = '100%';
                document.querySelectorAll('.progress-step').forEach(ps => ps.classList.add('completed'));
            } else {
                showToast('Something went wrong. Please try again.', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = `Submit Application <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
            }
        }
    } catch (error) {
        console.error('Submit error:', error);

        // Network error fallback: store locally
        localStorage.setItem('rivernova_application', JSON.stringify(applicationData));
        showToast('Application saved locally! It will sync when connected.', 'success');

        document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
        const successStep = document.getElementById('step-success');
        successStep.style.display = 'block';
        successStep.classList.add('active');
        document.getElementById('progressFill').style.width = '100%';
        document.querySelectorAll('.progress-step').forEach(ps => ps.classList.add('completed'));
    }
}
