// Admin Authentication
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('login-error');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    
    // Toggle password visibility
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Change icon (simple toggle)
            const svg = togglePassword.querySelector('svg');
            if (type === 'text') {
                svg.innerHTML = `
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke-width="2"/>
                    <line x1="1" y1="1" x2="23" y2="23" stroke-width="2"/>
                `;
            } else {
                svg.innerHTML = `
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" stroke-width="2"/>
                `;
            }
        });
    }
    
    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            
            // Simple authentication (in production, use secure backend)
            // Default credentials: admin / 132575
            if (username === 'admin' && password === '132575') {
                // Store session
                sessionStorage.setItem('adminLoggedIn', 'true');
                sessionStorage.setItem('adminUsername', username);
                
                if (remember) {
                    localStorage.setItem('adminRemember', 'true');
                    localStorage.setItem('adminUsername', username);
                }
                
                // Redirect to dashboard
                window.location.href = 'admin-dashboard.html';
            } else {
                errorMessage.textContent = 'Неверное имя пользователя или пароль';
                errorMessage.classList.add('show');
                
                // Hide error after 5 seconds
                setTimeout(() => {
                    errorMessage.classList.remove('show');
                }, 5000);
            }
        });
    }
    
    // Check if already logged in
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        window.location.href = 'admin-dashboard.html';
    }
    
    // Fill remembered username
    if (localStorage.getItem('adminRemember') === 'true' && document.getElementById('username')) {
        const rememberedUsername = localStorage.getItem('adminUsername');
        if (rememberedUsername) {
            document.getElementById('username').value = rememberedUsername;
            document.getElementById('remember').checked = true;
        }
    }
});

