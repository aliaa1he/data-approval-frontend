<template>
  <div class="form-container">
    <h2 class="form-title">Create Your Account</h2>

    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label>Name</label>
        <input v-model="form.name" type="text" placeholder="Enter your name" />
        <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label>Email</label>
        <input v-model="form.email" type="email" placeholder="Enter your email" />
        <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
      </div>

      <div class="form-group">
        <label>Password</label>
        <input v-model="form.password" type="password" placeholder="Enter your password" />
        <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
      </div>

      <button type="submit">Register</button>

      <div v-if="serverError" class="error-box">{{ serverError }}</div>
      <div v-if="successMessage" class="success-box">{{ successMessage }}</div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { register } from '../services/apiService';

const router = useRouter();
const form = ref({
  name: '',
  email: '',
  password: ''
});
const errors = ref({});
const serverError = ref('');
const successMessage = ref('');

const validate = () => {
  errors.value = {};
  if (!form.value.name) {
    errors.value.name = 'Name is required';
  } else if (form.value.name.length > 255) {
    errors.value.name = 'Name must not exceed 255 characters';
  }
  if (!form.value.email) {
    errors.value.email = 'Email is required';
  } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.value.email)) {
    errors.value.email = 'Invalid email format';
  } else if (form.value.email.length > 255) {
    errors.value.email = 'Email must not exceed 255 characters';
  }
  if (!form.value.password) {
    errors.value.password = 'Password is required';
  } else if (form.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters';
  }
  return Object.keys(errors.value).length === 0;
};

const handleRegister = async () => {
  serverError.value = '';
  successMessage.value = '';
  if (!validate()) return;
  try {
    await register(form.value);
    successMessage.value = 'Registration successful! Redirecting to login...';
    setTimeout(() => router.push('/login'), 2000);
  } catch (err) {
    serverError.value = err.response?.data?.message || 'Registration failed';
  }
};
</script>

<style scoped>
.form-container {
  width: 400px;
  margin: 60px auto;
  padding: 40px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

.form-title {
  text-align: center;
  margin-bottom: 24px;
  color: #2c8f6b;
  font-size: 1.6em;
  font-weight: 700;
}

.form-group {
  margin-bottom: 18px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  text-align:left;
  color: #333;
}

input {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #ccc;
  background: #f9f9f9;
  color: #333;
  font-size: 1em;
  transition: border-color 0.3s, background 0.3s;
}

input:focus {
  border-color: #42b883;
  background: #fff;
  outline: none;
}

button {
  width: 100%;
  padding: 12px 0;
  background: linear-gradient(90deg, #42b883 0%, #2c8f6b 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  transition: transform 0.2s, background 0.3s;
}

button:hover {
  transform: translateY(-2px);
  background: linear-gradient(90deg, #2c8f6b 0%, #42b883 100%);
}

.error-message {
  color: #b71c1c;
  font-size: 0.9em;
  margin-top: 4px;
  display: block;
  text-align:left;

}

.error-box {
  margin-top: 16px;
  background: #ffebee;
  color: #b71c1c;
  padding: 12px;
  border-radius: 10px;
  text-align: center;
  border: 1px solid #f5c6cb;
  font-weight: 500;
}

.success-box {
  margin-top: 16px;
  background: #e8f5e9;
  color: #1b5e20;
  padding: 12px;
  border-radius: 10px;
  text-align: center;
  border: 1px solid #c3e6cb;
  font-weight: 500;
}
</style>
