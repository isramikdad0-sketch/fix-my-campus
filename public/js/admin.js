document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('adminComplaintsList');
    const token = localStorage.getItem('token');

    const loadComplaints = async () => {
        try {
            const res = await fetch('/api/complaints', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const complaints = await res.json();
                renderTable(complaints);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const renderTable = (complaints) => {
        tableBody.innerHTML = '';
        complaints.forEach(c => {
            const tr = document.createElement('tr');

            // Format existing assigned info
            let assignedInfo = '-';
            if (c.assigned_to) {
                assignedInfo = `${c.assigned_to}<br><small class="text-muted">${c.assigned_contact || ''}</small>`;
            }

            tr.innerHTML = `
                <td>#${c.id}</td>
                <td>${c.username || 'User ' + c.user_id}</td>
                <td>${c.title}</td>
                <td>${c.category}</td>
                <td>${c.location}</td>
                <td>
                    ${c.image_url ? `<a href="${c.image_url}" target="_blank" style="color: var(--primary); text-decoration: underline;">View</a>` : 'No Image'}
                </td>
                <td>${assignedInfo}</td>
                <td>
                    <span class="status-badge ${getStatusClass(c.status)}">${c.status}</span>
                </td>
                <td>
                    <select onchange="updateStatus(${c.id}, this.value, '${c.assigned_to || ''}', '${c.assigned_contact || ''}')" class="action-select">
                        <option value="Pending" ${c.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="In Progress" ${c.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                        <option value="Spam" ${c.status === 'Spam' ? 'selected' : ''}>Spam</option>
                    </select>
                </td>
                <td>
                    <button onclick="markAsSpam(${c.id})" class="btn btn-sm" style="background: #f59e0b; color: white; margin-bottom: 2px;">Mark Spam</button>
                    <button onclick="deleteComplaint(${c.id})" class="btn btn-danger btn-sm">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    };

    const getStatusClass = (status) => {
        if (status === 'Pending') return 'status-pending';
        if (status === 'In Progress') return 'status-inprogress';
        if (status === 'Resolved') return 'status-resolved';
        return ''; // Spam or default
    };

    window.updateStatus = async (id, status, existingAssignedTo, existingContact) => {
        let assigned_to = existingAssignedTo;
        let assigned_contact = existingContact;

        // Logic:
        // If moving to 'In Progress', we MUST have an assigned person.
        // If moving to 'Resolved', we use existing info (don't ask again).

        if (status === 'In Progress') {
            // Only ask if not already assigned
            if (!assigned_to || assigned_to === 'null' || assigned_to === 'undefined') {
                assigned_to = prompt('Enter name of person handling this:');
                if (!assigned_to) return; // Cancelled

                assigned_contact = prompt('Enter contact number:');
                if (!assigned_contact) return; // Cancelled
            }
        }

        if (status === 'Resolved') {
            // If strictly ensuring someone was assigned before resolving:
            if ((!assigned_to || assigned_to === 'null') && !confirm("No staff assigned yet. Resolve anyway?")) {
                return;
            }
        }

        try {
            const body = { status };
            // Send fields even if empty, backend handles update
            if (assigned_to && assigned_to !== 'null') body.assigned_to = assigned_to;
            if (assigned_contact && assigned_contact !== 'null') body.assigned_contact = assigned_contact;

            const res = await fetch(`/api/complaints/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                loadComplaints();
            } else {
                alert('Failed to update status');
            }
        } catch (err) {
            console.error(err);
        }
    };

    window.markAsSpam = (id) => {
        // Shortcut to just set status to Spam
        window.updateStatus(id, 'Spam', null, null);
    };

    window.deleteComplaint = async (id) => {
        if (!confirm('Are you sure you want to delete this complaint?')) return;
        try {
            const res = await fetch(`/api/complaints/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                loadComplaints();
            } else {
                alert('Failed to delete');
            }
        } catch (err) {
            console.error(err);
        }
    };

    await loadComplaints();
});
