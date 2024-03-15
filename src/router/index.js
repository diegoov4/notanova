import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/authStore'
import LandingHome from '@/views/LandingHome.vue'
import Login from '@/views/mLogin.vue'
import ComandaDetail from '@/views/ComandaDetail.vue'
import Clientes from '@/views/Clientes.vue'
import Mesas from '@/views/Mesas.vue'
import Productos from '@/views/Productos.vue'
import InformesEco from '@/views/InformesEco.vue'
import InformesInv from '@/views/InformesInv.vue'

const routes = [
  {
    path: '/',
    name: 'mLogin',
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: '/landingHome',
    name: 'LandingHome',
    component: LandingHome,
    meta: { requiresAuth: true },
  },
  {
    path: '/comandas/:id',
    name: 'ComandaDetail',
    component: ComandaDetail,
    meta: { requiresAuth: true },
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: Clientes,
    meta: { requiresAuth: true },
  },
  {
    path: '/mesas',
    name: 'Mesas',
    component: Mesas,
    meta: { requiresAuth: true },
  },
  {
    path: '/productos',
    name: 'Productos',
    component: Productos,
    meta: { requiresAuth: true },
  },
  {
    path: '/informes/economico',
    name: 'InformesEco',
    component: InformesEco,
    meta: { requiresAuth: true },
  },
  {
    path: '/informes/inventario',
    name: 'InformesInv',
    component: InformesInv,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'mLogin' })
  } else if (!to.meta.requiresAuth && authStore.isAuthenticated) {
    next({ name: 'LandingHome' })
  } else {
    next()
  }
})

export default router
