// Modern Signup Form Validation
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signupForm');
    
    if (!form) return console.error('Signup form not found');
    
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const termsCheckbox = document.querySelector('input[name="terms"]');

    // Real-time validation
    fullNameInput?.addEventListener('blur', validateFullName);
    emailInput?.addEventListener('blur', validateEmail);
    passwordInput?.addEventListener('blur', validatePassword);
    passwordInput?.addEventListener('input', checkPasswordStrength);
    confirmPasswordInput?.addEventListener('blur', validateConfirmPassword);

    function validateFullName() {
        const value = fullNameInput.value.trim();
        if (!value) return showError(fullNameInput, "Full name is required");
        if (value.length < 3) return showError(fullNameInput, "Full name must be at least 3 characters");
        clearError(fullNameInput);
        return true;
    }

    function validateEmail() {
        const value = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) return showError(emailInput, "Email is required");
        if (!emailRegex.test(value)) return showError(emailInput, "Please enter a valid email address");
        clearError(emailInput);
        return true;
    }

    function validatePassword() {
        const value = passwordInput.value;
        if (!value) return showError(passwordInput, "Password is required");
        if (value.length < 6) return showError(passwordInput, "Password must be at least 6 characters");
        clearError(passwordInput);
        return true;
    }

    function validateConfirmPassword() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        if (!confirmPassword) return showError(confirmPasswordInput, "Please confirm your password");
        if (password !== confirmPassword) return showError(confirmPasswordInput, "Passwords do not match");
        clearError(confirmPasswordInput);
        return true;
    }

    function checkPasswordStrength() {
        const value = passwordInput.value;
        const parent = passwordInput.parentElement;
        let strengthIndicator = parent.querySelector('.password-strength');

        if (!strengthIndicator && value.length) {
            strengthIndicator = document.createElement('div');
            strengthIndicator.className = 'password-strength';
            parent.appendChild(strengthIndicator);
        }

        if (!strengthIndicator) return;

        let strength = 0;
        if (value.length >= 6) strength++;
        if (/[a-z]/.test(value)) strength++;
        if (/[A-Z]/.test(value)) strength++;
        if (/\d/.test(value)) strength++;
        if (/[@$!%*?&]/.test(value)) strength++;

        const levels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
        const colors = ['#ef4444', '#f59e0b', '#eab308', '#10b981', '#059669'];

        strengthIndicator.textContent = `Password Strength: ${levels[strength - 1] || 'Too Short'}`;
        strengthIndicator.style.color = colors[strength - 1] || '#6b7280';
        strengthIndicator.style.fontSize = '0.875rem';
        strengthIndicator.style.marginTop = '0.5rem';
    }

    function showError(input, message) {
        const parent = input.parentElement;
        let errorDiv = parent.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            parent.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
        input.classList.add('error');
        return false;
    }

    function clearError(input) {
        const parent = input.parentElement;
        const errorDiv = parent.querySelector('.error-message');
        if (errorDiv) errorDiv.remove();
        input.classList.remove('error');
    }

    // Form submission via AJAX
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const isFullNameValid = validateFullName();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isConfirmValid = validateConfirmPassword();

        if (!termsCheckbox.checked) {
            alert("Please agree to the Terms & Privacy Policy");
            return;
        }

        if (!isFullNameValid || !isEmailValid || !isPasswordValid || !isConfirmValid) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        const originalHTML = submitBtn.innerHTML;
        submitBtn.textContent = 'Creating Account...';

        const formData = new FormData();
        formData.append('fullName', fullNameInput.value.trim());
        formData.append('email', emailInput.value.trim());
        formData.append('password', passwordInput.value);
        formData.append('confirmPassword', confirmPasswordInput.value);

        try {
            // 👇 FIXED PATH (based on your folder structure)
            const response = await fetch(
                'Final_webtech_check/Final_webtech_G/Finale_project_webtech/controllers/signup_process.php',
                { method: 'POST', body: formData }
            );

            const data = await response.json();

            const alertDiv = document.createElement('div');
            if (data.success) {
                alertDiv.className = 'alert alert-success';
                alertDiv.innerHTML = '✔ Account created! Redirecting...';
                form.insertBefore(alertDiv, form.firstChild);
                setTimeout(() => window.location.href = 'Dashboard.php', 1000);
            } else {
                alertDiv.className = 'alert alert-error';
                alertDiv.textContent = '✗ ' + (data.message || 'Signup failed');
                form.insertBefore(alertDiv, form.firstChild);
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHTML;
                setTimeout(() => alertDiv.remove(), 5000);
            }
        } catch (err) {
            console.error(err);
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-error';
            alertDiv.textContent = '✗ Network error: ' + err.message;
            form.insertBefore(alertDiv, form.firstChild);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
            setTimeout(() => alertDiv.remove(), 5000);
        }
    });
});

