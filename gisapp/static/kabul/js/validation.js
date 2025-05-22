document.addEventListener('DOMContentLoaded', function() {
    // Validation patterns
    const patterns = {
        username: /^[a-zA-Z0-9_]{3,20}$/,
        email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
        password1: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/  // Only for first password in signup
    };

    // Error messages
    const errorMessages = {
        username: 'نام کاربری باید بین 3 تا 20 کاراکتر و شامل حروف، اعداد و _ باشد',
        email: 'لطفاً یک ایمیل معتبر وارد کنید',
        password1: 'رمز عبور باید حداقل 8 کاراکتر و شامل حروف و اعداد باشد',  // For first password
        password2: 'رمز عبور مطابقت ندارد'
    };

    // Add validation to input fields
    function validateField(input, pattern) {
        const field = input.id;
        const errorDiv = document.getElementById(`${field}-error`);
        
        if (field === 'password2') {
            const password1 = document.getElementById('password1');
            const isValid = input.value === password1.value;
            toggleError(errorDiv, isValid, errorMessages[field]);
            return isValid;
        }

        const isValid = pattern.test(input.value);
        toggleError(errorDiv, isValid, errorMessages[field]);
        return isValid;
    }

    // Toggle error message
    function toggleError(errorDiv, isValid, message) {
        if (!isValid) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        } else {
            errorDiv.style.display = 'none';
        }
    }

    // Add error divs and event listeners to all inputs
    document.querySelectorAll('input').forEach(input => {
        // Create error div
        const errorDiv = document.createElement('div');
        errorDiv.id = `${input.id}-error`;
        errorDiv.className = 'error-message';
        input.parentNode.insertBefore(errorDiv, input.nextSibling);

        // Add real-time validation
        input.addEventListener('input', () => {
            if (patterns[input.id]) {
                validateField(input, patterns[input.id]);
            } else if (input.id === 'password2') {
                validateField(input);
            }
        });
    });

    // Form submission validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            let isValid = true;

            // Validate all fields before submission
            this.querySelectorAll('input').forEach(input => {
                if (patterns[input.id]) {
                    if (!validateField(input, patterns[input.id])) {
                        isValid = false;
                    }
                } else if (input.id === 'password2') {
                    if (!validateField(input)) {
                        isValid = false;
                    }
                }
            });

            if (!isValid) {
                e.preventDefault();
            }
        });
    });
});