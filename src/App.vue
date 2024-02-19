<template>
  <div id="app">
    <Navbar v-if="authStore.isAuthenticated" @open-dialog="showNewComandaDialog = true" />
    <main
      class="main"
      :class="{
        'with-navbar': authStore.isAuthenticated,
        'without-navbar': !authStore.isAuthenticated,
      }"
    >
      <router-view />
    </main>
    <!-- <Footer v-if="isAuthenticated" /> -->
  </div>
</template>

<script>
import { useAuthStore } from '@/store/authStore'
import Navbar from '@/components/NotaNavbar.vue'

export default {
  name: 'App',
  components: {
    Navbar,
  },
  setup() {
    const authStore = useAuthStore()
    return {
      authStore,
      showNewComandaDialog: false,
    }
  },
}
</script>
