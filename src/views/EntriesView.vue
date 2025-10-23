<template>
  <div class="entries-container">
    <div class="header">
      <h1>Entries Management</h1>
      <div class="actions">
        <button @click="goToEntryForm" class="btn-primary">Add New Entry</button>
        <button @click="loadStatistics" class="btn-secondary">View Statistics</button>
        <button @click="handleLogout" class="btn-logout">Logout</button>
      </div>
    </div>

    <div v-if="showStatistics" class="modal-overlay" @click="showStatistics = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Statistics</h2>
          <button @click="showStatistics = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="stats-grid">
            <div class="stat-card">
              <h3>Total Entries</h3>
              <p class="stat-number">{{ statistics.total_entries }}</p>
            </div>
            <div class="stat-card">
              <h3>Pending</h3>
              <p class="stat-number pending">{{ statistics.pending_entries }}</p>
            </div>
            <div class="stat-card">
              <h3>Approved</h3>
              <p class="stat-number approved">{{ statistics.approved_entries }}</p>
            </div>
            <div class="stat-card">
              <h3>Rejected</h3>
              <p class="stat-number rejected">{{ statistics.rejected_entries }}</p>
            </div>
            <div class="stat-card">
              <h3>Total Value</h3>
              <p class="stat-number">${{ statistics.total_value ? statistics.total_value.toFixed(2) : '0.00' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Entries Table -->
    <div class="table-container">
      <table v-if="entries.length > 0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Category</th>
            <th>Numeric Value</th>
            <th>Date</th>
            <th>Status</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in entries" :key="entry.id">
            <td>{{ entry.category }}</td>
            <td>${{ entry.numeric_value ? entry.numeric_value.toFixed(2) : '0.00' }}</td>
            <td>{{ formatDate(entry.date) }}</td>
            <td>
              <span class="status-badge" :class="entry.status">{{ entry.status }}</span>
            </td>
            <td>{{ entry.notes || '-' }}</td>
            <td class="actions-cell">
              <button 
                v-if="entry.status === 'pending'" 
                @click="updateStatus(entry.id, 'approved')"
                class="btn-approve"
              >
                Approve
              </button>
              <button 
                v-if="entry.status === 'pending'" 
                @click="updateStatus(entry.id, 'rejected')"
                class="btn-reject"
              >
                Reject
              </button>
              <button 
                @click="deleteEntry(entry.id)"
                class="btn-delete"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-else class="no-entries">
        <p>No entries found. <button @click="goToEntryForm" class="link-btn">Create your first entry</button></p>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="message" class="message" :class="messageType">{{ message }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
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
const loading = ref(false);
const message = ref('');
const messageType = ref('');
const showStatistics = ref(false);
const statistics = ref({});

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
    showStatistics.value = true;
  } catch (error) {
    message.value = 'Error loading statistics';
    messageType.value = 'error';
  }
};

const updateStatus = async (id, status) => {
  try {
    await updateEntryStatus(id, status);
    message.value = `Entry ${status} successfully`;
    messageType.value = 'success';
    await loadEntries();
  } catch (error) {
    message.value = `Error updating entry status`;
    messageType.value = 'error';
  }
};

const deleteEntry = async (id) => {
  if (!confirm('Are you sure you want to delete this entry?')) return;
  
  try {
    await deleteEntryAPI(id);
    message.value = 'Entry deleted successfully';
    messageType.value = 'success';
    await loadEntries();
  } catch (error) {
    message.value = 'Error deleting entry';
    messageType.value = 'error';
  }
};

const goToEntryForm = () => {
  router.push('/entry-form');
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
});
</script>

<style scoped>
.entries-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.header h1 {
  color: #333;
  margin: 0;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary, .btn-logout {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(90deg, #42b883 0%, #2c8f6b 100%);
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-logout {
  background: #dc3545;
  color: white;
}

.btn-primary:hover, .btn-secondary:hover, .btn-logout:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.approved {
  background: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.actions-cell {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-approve, .btn-reject, .btn-delete {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85em;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-approve {
  background: #28a745;
  color: white;
}

.btn-reject {
  background: #dc3545;
  color: white;
}

.btn-delete {
  background: #6c757d;
  color: white;
}

.btn-approve:hover, .btn-reject:hover, .btn-delete:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.no-entries {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.link-btn {
  background: none;
  border: none;
  color: #42b883;
  text-decoration: underline;
  cursor: pointer;
  font-size: inherit;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.message {
  margin: 20px 0;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.stat-card {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-card h3 {
  margin: 0 0 10px 0;
  color: #6c757d;
  font-size: 0.9em;
}

.stat-number {
  font-size: 2em;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.stat-number.pending { color: #ffc107; }
.stat-number.approved { color: #28a745; }
.stat-number.rejected { color: #dc3545; }

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .actions {
    justify-content: center;
  }
  
  table {
    font-size: 0.9em;
  }
  
  th, td {
    padding: 10px 8px;
  }
  
  .actions-cell {
    flex-direction: column;
  }
}
</style>
