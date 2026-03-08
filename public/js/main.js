// Check authentication state on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    // Auth Guard for protected pages (simple client-side check)
    const protectedPages = ['/dashboard.html', '/report.html', '/admin.html'];
    const publicPages = ['/login.html', '/register.html'];
    const currentPath = window.location.pathname;

    if (protectedPages.includes(currentPath) && !token) {
        window.location.href = '/login.html';
    }

    if (publicPages.includes(currentPath) && token) {
        window.location.href = '/dashboard.html';
    }

    // Role Guard for admin
    if (currentPath === '/admin.html' && user && user.role !== 'admin') {
        window.location.href = '/dashboard.html';
    }

    // Update UI
    const userNameElement = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');

    if (user && userNameElement) {
        userNameElement.textContent = `Hello, ${user.username}`;
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login.html';
        });
    }
});
