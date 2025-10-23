<template>
  <div>
    <LoginForm />
    <div class="mt-4 text-center">
      <button @click="goToRegister" class="link-btn">Don't have an account? Register</button>
    </div>
  </div>
</template>

<script setup>
import LoginForm from '../components/LoginForm.vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const goToRegister = () => {
  router.push('/register');
};
</script>

<style scoped>
.link-btn {
  background: none;
  border: none;
  color: #42b883;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  font-size: 1em;
}
.link-btn:hover {
  color: #2c8f6b;
}
</style>
