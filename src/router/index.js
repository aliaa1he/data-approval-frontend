import { createRouter, createWebHistory } from 'vue-router';
import RegisterView from '../views/RegisterView.vue';
import LoginView from '../views/LoginView.vue';
import EntryFormView from '../views/EntryFormView.vue';
import EntriesView from '../views/EntriesView.vue';
import UserDashboard from '../views/UserDashboard.vue';
import AdminDashboard from '../views/AdminDashboard.vue';

const routes = [
  { path: '/register', component: RegisterView },
  { path: '/login', component: LoginView },
  { path: '/entry-form', component: EntryFormView },
  { path: '/entries', component: EntriesView },
  { path: '/user-dashboard', component: UserDashboard },
  { path: '/admin-dashboard', component: AdminDashboard },
  { path: '/', redirect: '/login' }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
