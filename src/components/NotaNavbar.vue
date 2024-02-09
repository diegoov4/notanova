<template>
  <nav class="navbar">
    <div class="logo">
      <img src="@/assets/logo_final.png" @click="goToLandingHome" class="home-button" alt="NotaNova Logo" />
    </div>
    <div class="navbar-menu">
      <button @click="openDialog" class="button button-green">+ Comanda</button>
      <router-link to="/productos" class="navbar-item">Productos</router-link>
      <router-link to="/clientes" class="navbar-item">Clientes</router-link>
      <router-link to="/mesas" class="navbar-item">Mesas</router-link>
    </div>
    <div class="navbar-end">
      <span class="navbar-item">{{ user?.email }}</span> <!-- Mostrar el email del usuario autenticado -->
      <img src="@/assets/logout_w.png" @click="logout" class="logout-button" alt="NotaNova Logo" />
    </div>
  </nav>
</template>
  
<script>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/authStore';
import { useCommonStore } from '@/store/commonStore';
import { supabase } from '@/services/supabase';

export default {
  name: 'NotaNavbar',
  setup() {
    const authStore = useAuthStore();
    const commonStore = useCommonStore();
    const router = useRouter();

    const openDialog = () => {
      router.push({ name: 'LandingHome' });
      commonStore.setShowNewComandaDialog(true);
    };
    
    const logout = async () => {
      await supabase.auth.signOut();
      authStore.clearUser();
      commonStore.clearData();
      router.push({ name: 'mLogin' });
    };

    const goToLandingHome = () => {
      router.push({ name: 'LandingHome' });
    }

    return {
      user: authStore.user,
      openDialog,
      goToLandingHome,
      logout,
    };
  },
};
</script>
  
<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 2rem;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #333;
  z-index: 1000;
}

.navbar-menu {
  display: flex;
}

.navbar-item {
  padding: 0.75rem 1rem;
  margin: 0 0.5rem;
  background-color: transparent;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  color: #333;
  transition: background-color 0.3s;
}

.navbar-item:hover{
  background-color: #f2f2f2;
  text-decoration: none;
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
  font-size: 1.5rem;
  margin-left: 1rem;
  color: #019365;
  height: 25px;
}

.logout-button:hover {
  color: #be8745; /* Cambiar color al hacer hover */
}

/* Estilo para los íconos si usas FontAwesome o similar */
.icon {
  transition: color 0.3s ease; /* Transición suave para el color */
}
</style>  