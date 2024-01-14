<template>
  <nav class="navbar">
    <div class="logo">
      <img src="@/assets/logo_final.png" alt="NotaNova Logo" />
    </div>
    <div class="navbar-menu">
      <router-link to="/comandas" class="navbar-item" @click.prevent="showNewComandaDialog = true">Nueva
        Comanda</router-link>
      <router-link to="/productos" class="navbar-item">Productos</router-link>
      <router-link to="/clientes" class="navbar-item">Clientes</router-link>
      <router-link to="/mesas" class="navbar-item">Mesas</router-link>
    </div>
    <div class="navbar-end">
      <span class="navbar-item">{{ user?.email }}</span> <!-- Mostrar el email del usuario autenticado -->
      <img src="@/assets/logout_w.png" @click="logout" class="logout-button" alt="NotaNova Logo" />
    </div>
  </nav>
  <!-- Diálogo para nueva comanda -->
  <NewComandaDialog v-if="showNewComandaDialog" @close="showNewComandaDialog = false" />
</template>
  
<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase';
import NewComandaDialog from '@/components/NewComandaDialog.vue';

export default {
  name: 'NotaNavbar',
  components: {
    NewComandaDialog,
  },
  setup() {
    const authStore = useAuthStore();
    const showNewComandaDialog = ref(false);
    const router = useRouter()

    const logout = async () => {
      await supabase.auth.signOut();
      authStore.clearUser();
      // Aquí se podría incluir lógica adicional después del cierre de sesión
      router.push({ name: 'mLogin' });
    };

    return {
      user: authStore.user,
      logout,
      showNewComandaDialog,
    };
  },
};
</script>
  
<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: var(--color-primary, #665f56);
  box-shadow: 0 7px 4px rgba(0, 0, 0, 0.4);
  color: var(--text-color, white);
  z-index: 1000;
}

/* Sombreado y opacidad en la cabecera */
.logo img {
  height: 50px;
}

.navbar-menu {
  display: flex;
}

.navbar-item {
  padding: 6px;
  margin-right: 1rem;
  color: var(--text-color, white);
}

.navbar-item:hover {
  background-color: rgba(55, 55, 55, 0.5);
  border-radius: 5px;
}

.navbar-end {
  display: flex;
  align-items: center;
}

/* ----------------------------------------------------------------- */
/*                      LOGOUT BUTTON                                */
/* ----------------------------------------------------------------- */
.logout-button {
  cursor: pointer;
  position: relative;
  /* Posicionamiento relativo para el pseudo-elemento */
  /* background: url('@/assets/logout_w.png') no-repeat center center; */
  color: azure;
  height: 30px;
}

.logout-button:hover::before {
  content: 'Cerrar Sesión';
  /* Texto alternativo al hacer hover */
  /* position: absolute;
  left: 0;
  top: -30px;
  white-space: nowrap;
  font-size: 12px; */
}
</style>  