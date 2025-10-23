<template>
  <div class="entry-form-container">
    <h1>Entry Form</h1>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="category">Category</label>
        <select id="category" v-model="form.category">
          <option value="">Select Category</option>
          <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
        </select>
        <span v-if="errors.category" class="error-message">{{ errors.category }}</span>
      </div>

      <div class="form-group">
        <label for="numeric_value">Numeric Value</label>
        <input id="numeric_value" v-model.number="form.numeric_value" type="number" step="any" />
        <span v-if="errors.numeric_value" class="error-message">{{ errors.numeric_value }}</span>
      </div>

      <div class="form-group">
        <label for="date">Date</label>
        <input id="date" v-model="form.date" type="date" :max="today" />
        <span v-if="errors.date" class="error-message">{{ errors.date }}</span>
      </div>
      
      <div v-if="errors.duplicate" class="error-message duplicate-error">
        {{ errors.duplicate }}
      </div>

      <div class="form-group">
        <label for="notes">Notes</label>
        <textarea id="notes" v-model="form.notes" rows="3" placeholder="Optional"></textarea>
      </div>

      
      <button type="submit" :disabled="loading">
        {{ loading ? 'Submitting...' : 'Submit Entry' }}
      </button>
      
      <div v-if="message" class="message" :class="messageType">
        {{ message }}
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createEntry, getEntries } from '../services/apiService';

const router = useRouter();

const categories = ['Finance', 'HR', 'IT', 'Operations', 'Marketing'];

const form = ref({
  category: '',
  numeric_value: null,
  date: '',
  notes: ''
});

const loading = ref(false);
const message = ref('');
const messageType = ref('');
const errors = ref({});
const previousEntries = ref([]);
const today = new Date().toISOString().split('T')[0];

const loadPreviousEntries = async () => {
  try {
    const res = await getEntries();
    previousEntries.value = res.data.data || [];
  } catch (err) {
    console.warn('Could not load previous entries');
  }
};

const validateForm = () => {
  errors.value = {};

  if (!form.value.category) {
    errors.value.category = 'Please select a category.';
  }

  if (form.value.numeric_value === null || form.value.numeric_value === '') {
    errors.value.numeric_value = ' Numeric value is required.';
  } else if (isNaN(form.value.numeric_value) || form.value.numeric_value < 0) {
    errors.value.numeric_value = 'Numeric value must be a number and greater than or equal to 0.';
  }

  if (!form.value.date) {
    errors.value.date = ' Date is required.';
  } else {
    const selectedDate = new Date(form.value.date);
    const todayDate = new Date(today);
    if (selectedDate > todayDate) {
      errors.value.date = ' Date cannot be in the future.';
    }
  }

  const isDuplicate = previousEntries.value.some(entry =>
    entry.category === form.value.category &&
    Number(entry.numeric_value) === Number(form.value.numeric_value) &&
    entry.date === form.value.date
  );

  if (isDuplicate) {
    errors.value.duplicate = ' This entry already exists with the same category, value, and date.';
  }

  return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    message.value = ' Please fix the errors below before submitting.';
    messageType.value = 'error';
    return;
  }

  loading.value = true;
  message.value = '';

  try {
    await createEntry(form.value);
    message.value = ' Entry submitted successfully!';
    messageType.value = 'success';

    // Reset form
    form.value = {
      category: '',
      numeric_value: null,
      date: '',
      notes: ''
    };
    errors.value = {};

    await loadPreviousEntries();

    setTimeout(() => {
      router.push('/user-dashboard');
    }, 2000);

  } catch (error) {
     if (error.response && error.response.data && error.response.data.message) {
      const serverMessage = error.response.data.message;
      if (serverMessage.toLowerCase().includes('duplicate')) {
        message.value = 'This entry already exists with the same category, value, and date.';
      } else {
        message.value = `${serverMessage}`;
      }
    } else {
      message.value = 'Error submitting entry. Please try again.';
    }
    messageType.value = 'error';
  } finally {
    loading.value = false;
  }
};

loadPreviousEntries();
</script>


<style scoped>
.entry-form-container {
  max-width: 650px;
  margin: 20px auto;
  padding: 40px;
  border: none;
  text-align: left;
  border-radius: 20px;
  background: #cfdce8;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.12);
}

h1 {
  text-align: center;
  color: #1e293b;
  margin-bottom: 36px;
  font-size: 28px;
  font-weight: 700;
}

.form-group {
  margin-bottom: 28px;
}

label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #334155;
  font-size: 15px;
}

input, textarea, select {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: #f8fafc;
  color: #1e293b;
  font-family: inherit;
}

input:focus, textarea:focus, select:focus {
  border-color: #6366f1;
  outline: none;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

input:hover, textarea:hover, select:hover {
  border-color: #cbd5e1;
}

textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23334155' d='M4.5 6l3.5 3.5L11.5 6z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 45px;
}

button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 12px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

button:hover:not(:disabled) {
  background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.message {
  margin-top: 20px;
  padding: 16px 20px;
  border-radius: 12px;
  text-align: center;
  font-weight: 500;
  font-size: 15px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.success {
  background: #dcfce7;
  color: #166534;
  border: 2px solid #86efac;
}

.message.error {
  background: #fee2e2;
  color: #991b1b;
  border: 2px solid #fca5a5;
}

.error-message {
  color: #ef4444;
  font-size: 14px;
  margin-top: 8px;
  display: block;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .entry-form-container {
    margin: 15px;
    padding: 28px 24px;
    border-radius: 16px;
  }
  
  h1 {
    font-size: 24px;
    margin-bottom: 28px;
  }
  
  .form-group {
    margin-bottom: 24px;
  }
  
  label {
    font-size: 14px;
  }
  
  input, textarea, select {
    padding: 12px 14px;
    font-size: 14px;
  }
  
  button {
    padding: 14px;
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .entry-form-container {
    margin: 10px;
    padding: 24px 20px;
    border-radius: 12px;
  }
  
  h1 {
    font-size: 22px;
    margin-bottom: 24px;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  input, textarea, select {
    padding: 11px 12px;
    font-size: 14px;
  }
  
  button {
    padding: 13px;
    font-size: 14px;
  }
  
  .message {
    padding: 14px 16px;
    font-size: 14px;
  }
}
</style>
