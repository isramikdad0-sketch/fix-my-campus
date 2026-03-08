document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('complaintsGrid');
    const filters = document.querySelectorAll('.filters button');
    let allComplaints = [];

    const loadComplaints = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(getApiUrl('/api/complaints'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                allComplaints = await res.json();
                renderComplaints(allComplaints);
            } else {
                console.error('Failed to load complaints');
                grid.innerHTML = '<p>Failed to load complaints.</p>';
            }
        } catch (err) {
            console.error(err);
        }
    };

    const renderComplaints = (complaints) => {
        grid.innerHTML = '';
        if (complaints.length === 0) {
            grid.innerHTML = '<p>No complaints found.</p>';
            return;
        }

        complaints.forEach(c => {
            const card = document.createElement('div');
            card.className = 'complaint-card';

            const statusClass = c.status === 'Pending' ? 'status-pending' :
                c.status === 'In Progress' ? 'status-inprogress' : 'status-resolved';

            const imageUrl = c.image_url || 'https://via.placeholder.com/400x200?text=No+Image';

            card.innerHTML = `
                <div class="card-image">
                    <img src="${imageUrl}" alt="Complaint Image">
                </div>
                <div class="card-content">
                    <div class="card-header">
                        <span class="status-badge ${statusClass}">${c.status}</span>
                        <small>${new Date(c.created_at).toLocaleDateString()}</small>
                    </div>
                    <h3 class="card-title">${c.title}</h3>
                    <div class="card-meta">
                        <span>📍 ${c.location}</span>
                        <span>🏷️ ${c.category}</span>
                    </div>
                    <p class="card-desc">${c.description}</p>
                    
                    ${c.assigned_to ? `<p style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--primary);"><strong>Assigned To:</strong> ${c.assigned_to}</p>` : ''}
                    ${c.assigned_contact ? `<p style="margin-top: 0.25rem; font-size: 0.9rem; color: var(--text-light);"><strong>Contact:</strong> ${c.assigned_contact}</p>` : ''}
                    ${c.resolved_at ? `<p style="margin-top: 0.25rem; font-size: 0.9rem; color: var(--success);"><strong>Resolved At:</strong> ${new Date(c.resolved_at).toLocaleString()}</p>` : ''}

                    ${c.status === 'Pending' ? `
                        <button onclick="deleteComplaint(${c.id})" class="btn btn-danger" style="width: 100%; margin-top: 1rem; padding: 0.5rem;">Cancel Complaint</button>
                    ` : ''}
                </div>
            `;
            grid.appendChild(card);
        });

        renderHistoryTable(complaints);
    };

    const renderHistoryTable = (complaints) => {
        const tableBody = document.getElementById('historyTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        complaints.forEach(c => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid var(--border-color)';

            const statusColor = c.status === 'Pending' ? '#d97706' :
                c.status === 'In Progress' ? '#2563eb' : '#059669';

            tr.innerHTML = `
                <td style="padding: 1rem;">${new Date(c.created_at).toLocaleDateString()}</td>
                <td style="padding: 1rem; font-weight: 500;">${c.title}</td>
                <td style="padding: 1rem;">${c.category}</td>
                <td style="padding: 1rem; color: ${statusColor}; font-weight: 600;">${c.status}</td>
            `;
            tableBody.appendChild(tr);
        });
    };

    // Filter Logic
    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            filters.forEach(b => b.classList.remove('active'));
            filters.forEach(b => b.style.backgroundColor = 'transparent');
            filters.forEach(b => b.style.color = 'var(--primary)');

            btn.classList.add('active');
            btn.style.backgroundColor = 'var(--primary)';
            btn.style.color = 'white';

            const filter = btn.getAttribute('data-filter');
            if (filter === 'all') {
                renderComplaints(allComplaints);
            } else {
                const filtered = allComplaints.filter(c => c.status === filter);
                renderComplaints(filtered);
            }
        });
    });

    // Initial Load
    await loadComplaints();

    window.deleteComplaint = async (id) => {
        if (!confirm('Are you sure you want to cancel this complaint?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(getApiUrl(`/api/complaints/${id}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                alert('Complaint cancelled');
                loadComplaints();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to cancel');
            }
        } catch (err) {
            console.error(err);
        }
    };
});
