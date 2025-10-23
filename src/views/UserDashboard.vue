<template>
  <div class="user-dashboard">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">
        <span class="logo-title">Data Entry</span>
      </div>
      <nav class="nav-menu">
        <a href="#" class="nav-item active">
          <i class="fas fa-file-invoice"></i>
          <span>My Entries</span>
        </a>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="main-content">
      <header class="top-header">
        <div class="header-left">
          <h1>New Entries</h1>
        </div>
        <div class="header-right">
          <div class="user-profile">
            <div class="avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="user-info">
              <span class="user-name">{{ userName }}</span>
            </div>
          </div>
          <button class="icon-btn" @click="handleLogout" title="Logout"><i class="fas fa-sign-out-alt"></i></button>
        </div>
      </header>  
      <div class="status-create-row">
        <button class="btn-create-pr" @click="goToEntryForm"><i class="fas fa-plus"></i> CREATE NEW ENTRY</button>
      </div>

      <div class="table-section">
        <table class="styled-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Numeric Value</th>
              <th>Date</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in entries" :key="entry.id">
              <td>{{ entry.category }}</td>
              <td>${{ entry.numeric_value ? Number(entry.numeric_value).toFixed(2) : '0.00' }}</td>
              <td>{{ formatDate(entry.date) }}</td>
              <td>
                <span class="status-badge" :class="entry.status ? entry.status.toLowerCase() : 'pending'">
                  {{ entry.status }}
                </span>
              </td>
              <td>{{ entry.notes || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getEntries, logout } from '../services/apiService';

const router = useRouter();

const entries = ref([]);
const loading = ref(false);
const message = ref('');
const messageType = ref('');
const searchQuery = ref('');
const userName = ref('');
const userInitials = ref('');

const loadUserInfo = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      userName.value = user.name || 'User';
      userInitials.value = user.name ? user.name.charAt(0).toUpperCase() : 'U';
    } else {
      userName.value = 'User';
      userInitials.value = 'U';
    }
  } catch (error) {
    console.error('Error loading user info:', error);
    userName.value = 'User';
    userInitials.value = 'U';
  }
};

const filteredEntries = computed(() => {
  if (!searchQuery.value) return entries.value;
  
  const query = searchQuery.value.toLowerCase();
  return entries.value.filter(entry => 
    entry.category?.toLowerCase().includes(query) ||
    entry.notes?.toLowerCase().includes(query) ||
    entry.status?.toLowerCase().includes(query) ||
    entry.id?.toString().includes(query)
  );
});

const pendingCount = computed(() => 
  entries.value.filter(e => e.status?.toLowerCase() === 'pending').length
);

const approvedCount = computed(() => 
  entries.value.filter(e => e.status?.toLowerCase() === 'approved').length
);

const rejectedCount = computed(() => 
  entries.value.filter(e => e.status?.toLowerCase() === 'rejected').length
);

const loadUserEntries = async () => {
  loading.value = true;
  message.value = '';
  messageType.value = '';
  
  try {
    console.log('Loading user entries...');
    const response = await getEntries();
    console.log('Entries response:', response);
    entries.value = response.data;
    console.log('User entries loaded:', entries.value);
  } catch (error) {
    console.error('Error loading user entries:', error);
    console.error('Error details:', error.response);
    
    let errorMessage = 'Error loading your entries. ';
    
    if (error.response?.status === 401) {
      errorMessage += 'Session expired. Please login again.';
    } else if (error.response?.status === 500) {
      errorMessage += 'Server error. Please try again later.';
    } else if (error.code === 'ERR_NETWORK') {
      errorMessage += 'Cannot connect to server. Please check if backend is running.';
    } else if (error.response?.data?.message) {
      errorMessage += error.response.data.message;
    } else {
      errorMessage += 'Please try again.';
    }
    
    message.value = errorMessage;
    messageType.value = 'error';
  } finally {
    loading.value = false;
  }
};

const goToEntryForm = () => {
  router.push('/entry-form');
};

const handleLogout = async () => {
  try {
    await logout();
    localStorage.removeItem('user');
    router.push('/login');
  } catch (error) {
    localStorage.removeItem('user');
    router.push('/login');
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

onMounted(() => {
  loadUserInfo();
  loadUserEntries();
});
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.user-dashboard {
  display: flex;
  width: 100%;
  height: 100vh;
  background: #f7f8fa;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.sidebar {
  width: 230px;
  background: #e8edf8;
  border-right: 1px solid #e5e7eb;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 32px 0 24px 0;
  flex-direction: row;
}
.logo-title {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.1;
  text-align: left;
}
.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 30px;
  color: #64748b;
  text-decoration: none;
  border-radius: 0 20px 20px 0;
  font-weight: 500;
  font-size: 15px;
  transition: background 0.2s, color 0.2s;
}
.nav-item.active, .nav-item:hover {
  background: #cad5fa;
  color: #4f51cf;
}
.nav-item i {
  width: 20px;
  font-size: 16px;
}
@media (max-width: 768px) {
  .sidebar {
    width: 70px;
  }
  
  .logo-title {
    display: none;
  }
  
  .nav-item span {
    display: none;
  }
  
  .nav-item {
    justify-content: center;
    padding: 12px 10px;
    border-radius: 8px;
  }
}
.main-content {
  flex: 1;
  padding: 0 16px 16px 16px;
  overflow-y: auto;
  min-width: 0;
}
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 0 16px 0;
}
.header-left h1 {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 18px;
}
.icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}
.icon-btn:hover {
  background: #e0e7ef;
}
.user-profile {
  color: #000;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
}
.tab {
  background: #f1f5f9;
  border: none;
  border-radius: 8px 8px 0 0;
  padding: 8px 18px;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.tab.active, .tab:hover {
  background: #6366f1;
  color: #fff;
}

.stats-cards {
  display: flex;
  gap: 24px;
  margin-bottom: 18px;
}
.stat-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(99,102,241,0.06);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 28px;
  min-width: 220px;
  flex: 1;
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
}
.stat-card.available .stat-icon {
  background: #34d399;
}
.stat-card.consumed .stat-icon {
  background: #60a5fa;
}
.stat-card.total .stat-icon {
  background: #fbbf24;
}
.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.stat-label {
  font-size: 13px;
  color: #64748b;
}
.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.status-create-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.status-legend {
  display: flex;
  gap: 18px;
  font-size: 14px;
}
.legend {
  font-weight: 600;
  padding-left: 18px;
  position: relative;
}
.legend.draft::before {
  content: '';
  position: absolute;
  left: 0; top: 7px;
  width: 10px; height: 10px;
  background: #fbbf24;
  border-radius: 50%;
}
.legend.rejected::before {
  content: '';
  position: absolute;
  left: 0; top: 7px;
  width: 10px; height: 10px;
  background: #ef4444;
  border-radius: 50%;
}
.legend.awaiting::before {
  content: '';
  position: absolute;
  left: 0; top: 7px;
  width: 10px; height: 10px;
  background: #f59e42;
  border-radius: 50%;
}
.btn-create-pr {
  background: #22c55e;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-create-pr:hover {
  background: #16a34a;
}

.table-section {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(99,102,241,0.06);
  padding: 0 0 18px 0;
  margin-top: 10px;
  overflow-x: auto;
}

.styled-table {
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
  font-size: 15px;
}
.styled-table th, .styled-table td {
  padding: 14px 10px;
  text-align: left;
}
.styled-table th {
  background: #f1f5f9;
  color: #64748b;
  font-weight: 700;
  font-size: 13px;
  border-bottom: 2px solid #e5e7eb;
}
.styled-table td {
  border-bottom: 1px solid #f3f4f6;
  color: #334155;
}
.styled-table tr:last-child td {
  border-bottom: none;
}
.status-badge {
  padding: 4px 14px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  text-transform: capitalize;
  display: inline-block;
}
.status-badge.pending {
  background: #6fbcda;
  color: #092bb4;
}
.status-badge.rejected {
  background: #fee2e2;
  color: #991b1b;
}
.status-badge.approved {
  background: #82ec58;
  color: #0f6112;
}
@media (max-width: 640px) {
  .status-create-row {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .btn-create-pr {
    width: 100%;
    justify-content: center;
  }
}
@media (max-width: 640px) {
  .top-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .header-left h1 {
    font-size: 18px;
  }
  
  .header-right {
    justify-content: space-between;
  }
  
  .user-profile {
    font-size: 14px;
  }
}
@media (max-width: 640px) {
  .styled-table {
    font-size: 13px;
    min-width: 500px;
  }
  
  .styled-table th,
  .styled-table td {
    padding: 10px 8px;
  }
  
  .styled-table th {
    font-size: 12px;
  }
  
  .status-badge {
    font-size: 11px;
    padding: 3px 10px;
  }
}
@media (max-width: 480px) {
  .main-content {
    padding: 0 8px 8px 8px;
  }
  
  .top-header {
    padding: 16px 0 12px 0;
  }
  
  .btn-create-pr {
    font-size: 14px;
    padding: 8px 20px;
  }
  
  .icon-btn {
    width: 34px;
    height: 34px;
    font-size: 14px;
  }
}
</style>