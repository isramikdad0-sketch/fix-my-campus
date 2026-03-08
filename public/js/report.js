document.getElementById('complaintForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('category', document.getElementById('category').value);
    formData.append('location', document.getElementById('location').value);
    formData.append('description', document.getElementById('description').value);

    const imageFile = document.getElementById('image').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    const token = localStorage.getItem('token');

    try {
        const res = await fetch(getApiUrl('/api/complaints'), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const contentType = res.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await res.json();
        } else {
            data = { message: await res.text() };
        }

        if (res.ok) {
            alert('Complaint submitted successfully!');
            window.location.href = '/dashboard.html';
        } else {
            alert(data.message || 'Submission failed');
        }
    } catch (err) {
        console.error('Report error:', err);
        alert('An error occurred. Check console for details.');
    }
});
