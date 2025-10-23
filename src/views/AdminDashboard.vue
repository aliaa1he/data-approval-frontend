<template>
  <div class="admin-dashboard">
    <aside class="sidebar">
      <div class="logo">
        <i class="fas fa-chart-line"></i>
        <span>AdminHub</span>
      </div>
      <nav class="nav-menu">
        <a href="#" class="nav-item active">
          <i class="fas fa-users"></i>
          <span>Entries</span>
        </a>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="main-content">
      <header class="top-header">
        <div class="header-left">
          <h1>Entries</h1>
          <p class="breadcrumb">Dashboard / Entries</p>
        </div>
        <div class="header-right">
          <div class="user-profile" style="cursor: pointer;">
            <div class="avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="user-info">
              <span class="user-name">Admin</span>
              <span class="user-role">Administrator</span>
            </div>
          </div>
          <button class="icon-btn" @click="handleLogout" >
            <i class="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </header>

      <!-- Stats Section -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card stat-total">
            <div class="stat-header">
              <div class="stat-icon-wrapper">
                <i class="fas fa-users"></i>
              </div>
            </div>
            <div class="stat-value">{{ statistics.by_status && statistics.by_status.Pending ? statistics.by_status.Pending : 0 }}</div>
            <div class="stat-label">Pending Entries</div>
          </div>

          <div class="stat-card stat-new">
            <div class="stat-header">
              <div class="stat-icon-wrapper">
                <i class="fas fa-check-circle"></i>
              </div>
            </div>
            <div class="stat-value">{{ statistics.by_status && statistics.by_status.Approved ? statistics.by_status.Approved : 0 }}</div>
            <div class="stat-label">Approved Entries</div>
          </div>

          <div class="stat-card stat-resigned">
            <div class="stat-header">
              <div class="stat-icon-wrapper">
                <i class="fas fa-times-circle"></i>
              </div>
            </div>
            <div class="stat-value">{{ statistics.by_status && statistics.by_status.Rejected ? statistics.by_status.Rejected : 0 }}</div>
            <div class="stat-label">Rejected Entries</div>
          </div>

          <div class="stat-card stat-turnover">
            <div class="stat-header">
              <div class="stat-icon-wrapper">
                <i class="fas fa-dollar-sign"></i>
              </div>
            </div>
            <div class="stat-value">${{ statistics.total_value ? Number(statistics.total_value).toFixed(0) : '0' }}</div>
            <div class="stat-label">Total Value</div>
          </div>
        </div>
      </div>
      <!-- Entries Table Section -->
      <div class="table-section">
        <div class="table-header">
          <h2>Entry List</h2>
          <div class="table-controls">
            <div class="filter-group">
              <select v-model="statusFilter" @change="filterEntries" class="filter-select">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div class="date-filters">
              <input type="date" v-model="dateFrom" :max="today" class="date-input" />
              <input type="date" v-model="dateTo" :max="today" class="date-input" />
            </div>
          </div>
        </div>

        <div class="table-container">
          <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <p>Loading entries...</p>
          </div>
          
          <div v-else-if="filteredEntries.length > 0" class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Category <i class="fas fa-sort"></i></th>
                  <th>Value <i class="fas fa-sort"></i></th>
                  <th>Date <i class="fas fa-sort"></i></th>
                  <th>Status <i class="fas fa-sort"></i></th>
                  <th>User <i class="fas fa-sort"></i></th>
                  <th>Approved By <i class="fas fa-sort"></i></th>
                  <th>Actions <i class="fas fa-sort"></i></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in filteredEntries" :key="entry.id">
                  <td>
                    <div class="user-cell">
                      <div class="user-avatar">{{ entry.category ? entry.category.charAt(0) : 'N' }}</div>
                      <span>{{ entry.category }}</span>
                    </div>
                  </td>
                  <td class="value-cell">${{ entry.numeric_value ? Number(entry.numeric_value).toFixed(2) : '0.00' }}</td>
                  <td>{{ formatDate(entry.date) }}</td>
                  <td>
                    <span class="status-badge" :class="entry.status ? entry.status.toLowerCase() : 'pending'">
                      {{ entry.status }}
                    </span>
                  </td>
                  <td>{{ entry.user && entry.user.name ? entry.user.name : '-' }}</td>
                  <td>{{ entry.approved_by && entry.approved_by.name ? entry.approved_by.name : '-' }}</td>
                  <td>
                    <div class="action-buttons">
                      <button 
                        v-if="entry.status && entry.status.toLowerCase() === 'pending'" 
                        @click="updateStatus(entry.id, 'approved')"
                        class="btn-icon btn-approve"
                        title="Approve"
                      >
                        <i class="fas fa-check"></i>
                      </button>
                      <button 
                        v-if="entry.status && entry.status.toLowerCase() === 'pending'" 
                        @click="updateStatus(entry.id, 'rejected')"
                        class="btn-icon btn-reject"
                        title="Reject"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                      <button 
                        @click="deleteEntry(entry.id)"
                        class="btn-icon btn-delete"
                        title="Delete"
                      >
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div v-else class="no-entries">
            <i class="fas fa-inbox"></i>
            <h3>No entries found</h3>
            <p>No entries match your current filter criteria</p>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <div class="pagination-info">
            Showing <strong>1-10</strong> of <strong>{{ filteredEntries.length }}</strong> results
          </div>
          <div class="pagination-controls">
            <button class="page-btn"><i class="fas fa-chevron-left"></i></button>
            <button class="page-btn active">1</button>
            <button class="page-btn">2</button>
            <button class="page-btn">3</button>
            <button class="page-btn">...</button>
            <button class="page-btn">10</button>
            <button class="page-btn"><i class="fas fa-chevron-right"></i></button>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="message" class="message" :class="messageType">
      <i v-if="messageType === 'success'" class="fas fa-check-circle"></i>
      <i v-else class="fas fa-exclamation-circle"></i>
      {{ message }}
    </div>
     <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-icon modal-icon-danger">
            <i class="fas fa-trash-alt"></i>
          </div>
          <h3>Delete Entry</h3>
          <p>Are you sure you want to delete this entry? This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button @click="cancelDelete" class="btn-cancel">Cancel</button>
          <button @click="confirmDelete" class="btn-confirm-delete">
            <i class="fas fa-trash-alt"></i>
            Delete Entry
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { 
  getEntries, 
  updateEntryStatus, 
  deleteEntry as deleteEntryAPI, 
  getEntryStatistics,
  logout
} from '../services/apiService';

const router = useRouter();

const entries = ref([]);
const statistics = ref({});
const loading = ref(false);
const message = ref('');
const messageType = ref('');
const statusFilter = ref('');

const today = new Date().toISOString().split('T')[0];
const dateFrom = ref("");
const dateTo = ref("");

const filteredEntries = computed(() => {
  let result = entries.value;
  if (statusFilter.value) {
    result = result.filter(
      entry => entry.status && entry.status.toLowerCase() === statusFilter.value.toLowerCase()
    );
  }
  if (dateFrom.value) {
    result = result.filter(entry => entry.date >= dateFrom.value);
  }
  if (dateTo.value) {
    result = result.filter(entry => entry.date <= dateTo.value);
  }
  return result;
});

const loadEntries = async () => {
  loading.value = true;
  try {
    const response = await getEntries();
    entries.value = response.data;
  } catch (error) {
    message.value = 'Error loading entries';
    messageType.value = 'error';
  } finally {
    loading.value = false;
  }
};

const loadStatistics = async () => {
  try {
    const response = await getEntryStatistics();
    statistics.value = response.data;
  } catch (error) {
    console.error('Error loading statistics:', error);
  }
};

const updateStatus = async (id, status) => {
  const formattedStatus =
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  try {
    await updateEntryStatus(id, formattedStatus);
    message.value = `Entry ${formattedStatus} successfully`;
    messageType.value = 'success';
    await loadEntries();
    await loadStatistics();
  } catch (error) {
    message.value = `Error updating entry status`;
    messageType.value = 'error';
  }
};

const deleteEntry = async (id) => {  
  try {
    await deleteEntryAPI(id);
    message.value = 'Entry deleted successfully';
    messageType.value = 'success';
    await loadEntries();
    await loadStatistics();
  } catch (error) {
    message.value = 'Error deleting entry';
    messageType.value = 'error';
  }
};

const handleLogout = async () => {
  try {
    await logout();
    router.push('/login');
  } catch (error) {
    router.push('/login');
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

onMounted(() => {
  loadEntries();
  loadStatistics();
});
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.admin-dashboard {
  display: flex;
  height: 100vh;
  background: #F7F8FA;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Sidebar */
.sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid #E5E7EB;
  padding: 24px 0;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 0 24px 32px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  color: #16A34A;
}

.logo i {
  font-size: 24px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #6B7280;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
  font-weight: 500;
}

.nav-item:hover {
  background: #F3F4F6;
  color: #111827;
}

.nav-item.active {
  background: #DCFCE7;
  color: #16A34A;
}

.nav-item i {
  width: 20px;
  font-size: 18px;
}

/* Main Content */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

/* Top Header */
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-left h1 {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.breadcrumb {
  color: #9CA3AF;
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  background: white;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  background: white;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #16A34A, #15803D);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
}

.user-role {
  font-size: 12px;
  color: #9CA3AF;
}

/* Stats Section */
.stats-section {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  flex: 1;
}

.stat-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 20px;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.stat-total .stat-icon-wrapper {
  background: #DBEAFE;
  color: #1D4ED8;
}

.stat-new .stat-icon-wrapper {
  background: #DCFCE7;
  color: #16A34A;
}

.stat-resigned .stat-icon-wrapper {
  background: #FEE2E2;
  color: #DC2626;
}

.stat-turnover .stat-icon-wrapper {
  background: #E0E7FF;
  color: #6366F1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 8px;
}

/* Table Section */
.table-section {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  padding: 20px 24px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.table-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.table-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}


.filter-group {
  display: flex;
  gap: 8px;
}


.filter-select, .date-input {
  padding: 8px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  cursor: pointer;
}

.date-filters {
  display: flex;
  gap: 8px;
}

/* Table */
.table-container {
  min-height: 400px;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #F3F4F6;
}

th {
  background: #F9FAFB;
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

th i {
  font-size: 10px;
  margin-left: 4px;
  color: #9CA3AF;
}

td {
  font-size: 14px;
  color: #374151;
}

tbody tr:hover {
  background: #F9FAFB;
}


.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #16A34A, #15803D);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.value-cell {
  font-weight: 600;
  color: #16A34A;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  display: inline-block;
}

.status-badge.pending {
  background: #FEF3C7;
  color: #92400E;
}

.status-badge.approved {
  background: #DCFCE7;
  color: #166534;
}

.status-badge.rejected {
  background: #FEE2E2;
  color: #991B1B;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-approve {
  background: #DCFCE7;
  color: #16A34A;
}

.btn-approve:hover {
  background: #BBF7D0;
}

.btn-reject {
  background: #FEE2E2;
  color: #DC2626;
}

.btn-reject:hover {
  background: #FECACA;
}

.btn-delete {
  background: #F3F4F6;
  color: #6B7280;
}

.btn-delete:hover {
  background: #E5E7EB;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #6B7280;
}

.loading p {
  margin-top: 16px;
  font-size: 14px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #F3F4F6;
  border-top: 3px solid #16A34A;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* No Entries */
.no-entries {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #9CA3AF;
}

.no-entries i {
  font-size: 64px;
  margin-bottom: 16px;
  color: #D1D5DB;
}

.no-entries h3 {
  font-size: 18px;
  font-weight: 600;
  color: #6B7280;
  margin-bottom: 8px;
}

.no-entries p {
  font-size: 14px;
  color: #9CA3AF;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #E5E7EB;
}

.pagination-info {
  font-size: 14px;
  color: #6B7280;
}

.pagination-controls {
  display: flex;
  gap: 4px;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  background: white;
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.page-btn.active {
  background: #16A34A;
  color: white;
  border-color: #16A34A;
}

/* Messages */
.message {
  position: fixed;
  top: 24px;
  right: 24px;
  padding: 16px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  z-index: 1000;
  animation: slideIn 0.3s ease;
  max-width: 400px;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.message i {
  font-size: 18px;
}

.message.success {
  background: #DCFCE7;
  color: #166534;
  border: 1px solid #BBF7D0;
}

.message.error {
  background: #FEE2E2;
  color: #991B1B;
  border: 1px solid #FECACA;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-section {
    flex-direction: column;
  }
  
  .chart-card {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .admin-dashboard {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    padding: 16px 0;
  }
  
  .nav-menu {
    flex-direction: row;
    overflow-x: auto;
    padding: 0 12px;
  }
  
  .nav-item span {
    display: none;
  }
  
  .main-content {
    padding: 16px;
  }
  
  .top-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .table-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .table-controls {
    width: 100%;
    flex-direction: column;
  }
  
  .pagination {
    flex-direction: column;
    gap: 16px;
  }
}
</style>