// Admin Dashboard Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'admin.html';
        return;
    }
    
    // Initialize
    initSidebar();
    initNavigation();
    initDashboard();
    initModal();
    
    // Load initial data
    loadDashboardData();
});

// Sidebar Toggle
function initSidebar() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Close sidebar on mobile when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 968) {
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
}

// Navigation
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Show corresponding page
            const page = this.getAttribute('data-page');
            showPage(page);
        });
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Вы уверены, что хотите выйти?')) {
                sessionStorage.removeItem('adminLoggedIn');
                sessionStorage.removeItem('adminUsername');
                window.location.href = 'admin.html';
            }
        });
    }
}

// Show page function (global for use in HTML)
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show selected page
    const selectedPage = document.getElementById(pageId + '-page');
    if (selectedPage) {
        selectedPage.classList.add('active');
        
        // Update page title
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            const titles = {
                'dashboard': 'Дашборд',
                'projects': 'Проекты',
                'services': 'Услуги',
                'requests': 'Заявки',
                'settings': 'Настройки'
            };
            pageTitle.textContent = titles[pageId] || 'Админ-панель';
        }
    }
    
    // Load page-specific data
    if (pageId === 'requests') {
        loadRequests();
    } else if (pageId === 'projects') {
        loadProjects();
    } else if (pageId === 'services') {
        loadServices();
    }
}

// Dashboard initialization
function initDashboard() {
    // Quick actions
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const onclick = this.getAttribute('onclick');
            if (onclick) {
                eval(onclick);
            }
        });
    });
}

// Load dashboard data
function loadDashboardData() {
    // Load stats (can be fetched from API in production)
    updateStats();
    loadRecentRequests();
}

function updateStats() {
    // In production, fetch from API
    const stats = {
        projects: 6,
        requests: 0,
        services: 6,
        clients: '150+'
    };
    
    const totalProjects = document.getElementById('total-projects');
    const newRequests = document.getElementById('new-requests');
    const totalServices = document.getElementById('total-services');
    const totalClients = document.getElementById('total-clients');
    
    if (totalProjects) totalProjects.textContent = stats.projects;
    if (newRequests) newRequests.textContent = stats.requests;
    if (totalServices) totalServices.textContent = stats.services;
    if (totalClients) totalClients.textContent = stats.clients;
}

function loadRecentRequests() {
    const container = document.getElementById('recent-requests');
    if (!container) return;
    
    // In production, fetch from API
    const requests = getStoredRequests();
    
    if (requests.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Заявок пока нет</p></div>';
        return;
    }
    
    container.innerHTML = requests.slice(0, 5).map(request => `
        <div class="request-item">
            <div class="request-info">
                <h4>${request.name}</h4>
                <p>${request.email}</p>
            </div>
            <div class="request-date">${request.date}</div>
        </div>
    `).join('');
}

// Load requests
function loadRequests() {
    const tbody = document.getElementById('requests-table-body');
    if (!tbody) return;
    
    const requests = getStoredRequests();
    
    if (requests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">Заявок пока нет</td></tr>';
        return;
    }
    
    tbody.innerHTML = requests.map(request => `
        <tr class="${request.isNew ? 'request-new' : ''}">
            <td>${request.date}</td>
            <td>${request.name}</td>
            <td>${request.email}</td>
            <td>${request.message || '-'}</td>
            <td><span class="badge ${request.isNew ? 'badge-new' : 'badge-read'}">${request.isNew ? 'Новая' : 'Прочитана'}</span></td>
            <td>
                <button class="btn-icon btn-view" onclick="viewRequest(${request.id})" title="Просмотр">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2"/>
                        <circle cx="12" cy="12" r="3" stroke-width="2"/>
                    </svg>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteRequest(${request.id})" title="Удалить">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="3 6 5 6 21 6" stroke-width="2"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-width="2"/>
                    </svg>
                </button>
            </td>
        </tr>
    `).join('');
}

// Get stored requests (from localStorage - in production use API)
function getStoredRequests() {
    const stored = localStorage.getItem('contactRequests');
    return stored ? JSON.parse(stored) : [];
}

// Save requests
function saveRequests(requests) {
    localStorage.setItem('contactRequests', JSON.stringify(requests));
}

// Load projects
function loadProjects() {
    // In production, fetch from API
    const tbody = document.getElementById('projects-table-body');
    if (tbody && tbody.children.length === 1) {
        // Already has default content
    }
}

// Load services
function loadServices() {
    // In production, fetch from API
    const tbody = document.getElementById('services-table-body');
    if (tbody && tbody.children.length === 1) {
        // Already has default content
    }
}

// Modal
function initModal() {
    const modal = document.getElementById('modal');
    const modalClose = document.getElementById('modal-close');
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

function openModal(content) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    if (modal && modalBody) {
        modalBody.innerHTML = content;
        modal.classList.add('active');
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// View request
function viewRequest(id) {
    const requests = getStoredRequests();
    const request = requests.find(r => r.id === id);
    
    if (!request) return;
    
    const content = `
        <h2 style="margin-bottom: 24px;">Детали заявки</h2>
        <div style="display: flex; flex-direction: column; gap: 16px;">
            <div>
                <strong>Дата:</strong> ${request.date}
            </div>
            <div>
                <strong>Имя:</strong> ${request.name}
            </div>
            <div>
                <strong>Email:</strong> ${request.email}
            </div>
            ${request.phone ? `<div><strong>Телефон:</strong> ${request.phone}</div>` : ''}
            <div>
                <strong>Сообщение:</strong>
                <p style="margin-top: 8px; padding: 12px; background: #f8fafc; border-radius: 6px;">${request.message || 'Не указано'}</p>
            </div>
        </div>
        <div style="margin-top: 24px; display: flex; gap: 12px;">
            <button class="btn-primary" onclick="markRequestRead(${id}); closeModal();">Отметить как прочитанную</button>
            <button class="btn-secondary" onclick="closeModal()">Закрыть</button>
        </div>
    `;
    
    openModal(content);
}

// Delete request
function deleteRequest(id) {
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) return;
    
    const requests = getStoredRequests();
    const filtered = requests.filter(r => r.id !== id);
    saveRequests(filtered);
    
    loadRequests();
    loadRecentRequests();
    updateStats();
}

// Mark request as read
function markRequestRead(id) {
    const requests = getStoredRequests();
    const updated = requests.map(r => {
        if (r.id === id) {
            r.isNew = false;
        }
        return r;
    });
    saveRequests(updated);
    
    loadRequests();
    loadRecentRequests();
    updateStats();
}

// Mark all as read
document.addEventListener('DOMContentLoaded', function() {
    const markAllReadBtn = document.getElementById('mark-all-read-btn');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', function() {
            if (!confirm('Отметить все заявки как прочитанные?')) return;
            
            const requests = getStoredRequests();
            const updated = requests.map(r => ({ ...r, isNew: false }));
            saveRequests(updated);
            
            loadRequests();
            loadRecentRequests();
            updateStats();
        });
    }
    
    // Handle form submissions from contact form (intercept and store)
    // This would normally be handled server-side
    window.addEventListener('message', function(e) {
        if (e.data && e.data.type === 'contactFormSubmit') {
            const requests = getStoredRequests();
            const newRequest = {
                id: Date.now(),
                date: new Date().toLocaleDateString('ru-RU'),
                name: e.data.name,
                email: e.data.email,
                phone: e.data.phone || '',
                message: e.data.message || '',
                isNew: true
            };
            requests.unshift(newRequest);
            saveRequests(requests);
            
            // Update stats if on requests page
            if (document.getElementById('requests-page')?.classList.contains('active')) {
                loadRequests();
            }
            updateStats();
            loadRecentRequests();
        }
    });
});

