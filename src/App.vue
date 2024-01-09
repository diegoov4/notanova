<template>
  <div id="app">
    <Navbar v-if="isAuthenticated" />
    <main class="main">
      <router-view />
    </main>
    <!-- <Footer v-if="isAuthenticated" /> -->
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Navbar from '@/components/NotaNavbar.vue';
import { supabase } from '@/services/supabase';

export default {
  name: 'App',
  components: {
    Navbar,
  },
  setup() {
    const isAuthenticated = ref(false);

    onMounted(async () => {
      const { data: session } = await supabase.auth.getSession();
      isAuthenticated.value = !!session;
    });

    return { isAuthenticated };
  },
};
</script>