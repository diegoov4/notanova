<template>
  <div id="app">
    <Navbar v-if="authStore.isAuthenticated" />
    <main class="main">
      <router-view />
    </main>
    <!-- <Footer v-if="isAuthenticated" /> -->
  </div>
</template>

<script>
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/NotaNavbar.vue';

export default {
  name: 'App',
  components: {
    Navbar,
  },
  setup() {
    const authStore = useAuthStore();
    return {
      authStore,
    };
  },
};
</script>