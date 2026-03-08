const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch(getApiUrl('/api/auth/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({ userId: data.userId, username: data.username, role: data.role }));

                if (data.role === 'admin') {
                    window.location.href = '/admin.html';
                } else {
                    window.location.href = '/dashboard.html';
                }
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        }
    });
}

if (registerForm) {
    const roleSelect = document.getElementById('role');
    const adminCodeGroup = document.getElementById('adminCodeGroup');

    roleSelect.addEventListener('change', () => {
        if (roleSelect.value === 'admin') {
            adminCodeGroup.style.display = 'block';
            document.getElementById('adminCode').required = true;
        } else {
            adminCodeGroup.style.display = 'none';
            document.getElementById('adminCode').required = false;
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        const adminCode = document.getElementById('adminCode').value;

        try {
            const res = await fetch(getApiUrl('/api/auth/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, role, adminCode })
            });

            const data = await res.json();

            if (res.ok) {
                alert('Registration successful! Please login.');
                window.location.href = '/login.html';
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        }
    });
}
