<template>
  <div class="login-container">
    <h2>Welcome Back 👋</h2>
    <form @submit.prevent="handleLogin">
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

      <button type="submit">Login</button>

      <div v-if="serverError" class="error-message">{{ serverError }}</div>
      <div v-if="message" class="success-message">{{ message }}</div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { login } from '../services/apiService'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({ email: '', password: '' })
const errors = ref({})
const serverError = ref('')
const message = ref('')

const validate = () => {
  errors.value = {}
  if (!form.value.email) {
    errors.value.email = 'Email is required'
  } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.value.email)) {
    errors.value.email = 'Invalid email format'
  }
  if (!form.value.password) {
    errors.value.password = 'Password is required'
  }
  return Object.keys(errors.value).length === 0
}

const handleLogin = async () => {
  serverError.value = ''
  if (!validate()) return

  try {
    const response = await login(form.value)
    message.value = 'Login successful! Redirecting...'

    const userRole = response.data.user?.role || 'user'
    setTimeout(() => {
      if (userRole === 'admin') router.push('/admin-dashboard')
      else router.push('/user-dashboard')
    }, 1500)
  } catch (err) {
    serverError.value =
      err.response?.data?.message ||
      err.message ||
      'Login failed. Please try again.'
  }
}
</script>

<style scoped>
.login-container {
  width: 400px;
  margin: 80px auto;
  padding: 40px 32px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  font-family: 'Poppins', sans-serif;
}

h2 {
  margin-bottom: 24px;
  color: #2c3e50;
}

.form-group {
  text-align: left;
  margin-bottom: 20px;
}

label {
  display: block;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 6px;
}

input {
  width: 93%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 15px;
  margin-bottom: 10px;
  outline: none;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #42b883;
}

button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #42b883, #2c8f6b);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background: linear-gradient(135deg, #2c8f6b, #42b883);
}

.error-message {
  color: #e74c3c;
  background: #fdecea;
  padding: 10px;
  border-radius: 8px;
  margin-top: 20px;
}

.success-message {
  color: #155724;
  background: #d4edda;
  padding: 10px;
  border-radius: 8px;
  margin-top: 10px;
}
</style>
