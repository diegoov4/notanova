import { createRouter, createWebHistory } from 'vue-router';
// import { useAuthStore } from '@/store/authStore';
import LandingHome from '@/views/LandingHome.vue';
import Login from '@/views/mLogin.vue';
import { supabase } from '@/services/supabase';

const routes = [
  {
    path: '/',
    name: 'mLogin',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/landingHome',
    name: 'LandingHome',
    component: LandingHome,
    meta: { requiresAuth: true }
  },
  {
    path: '/comandas/:id',
    name: 'ComandaDetail',
    component: () => import('@/views/ComandaDetail.vue'),
    meta: { requiresAuth: true }
  },
  // ... otras rutas
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  // const authStore = useAuthStore();
  // const user = authStore.user || await supabase.auth.getUser();

  // if (to.meta.requiresAuth && !user) {
  //   next({ name: 'mLogin' });
  // } else if (!to.meta.requiresAuth && user) {
  //   next({ name: 'LandingHome' });
  // } else {
  //   next();
  // }

  const session = supabase.auth.getSession();

  if (to.matched.some(record => record.meta.requiresAuth) && !session) {
    // Si la ruta requiere autenticación y no hay sesión, redirige al login
    next({ name: 'mLogin' });
  } else if (!to.matched.some(record => record.meta.requiresAuth) && session) {
    // Si la ruta no requiere autenticación y hay sesión, redirige a la Home
    next({ name: 'LandingHome' });
  } else {
    next(); // En cualquier otro caso, procede con la navegación normal
  }
});

export default router;