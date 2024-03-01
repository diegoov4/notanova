<script setup>
import { useAuthStore } from '@/store/authStore'
import Navbar from '@/components/NotaNavbar.vue'

const authStore = useAuthStore()

const showNewComandaDialog = false
</script>

<template>
  <!-- Config the App Layout directly here  -->
  <v-layout class="rounded rounded-md">
    <!-- Header of App-->
    <Navbar v-if="authStore.isAuthenticated" @open-dialog="showNewComandaDialog = true" />
    <!-- Main of App -->
    <v-main class="d-flex align-center justify-center bg-image" style="min-height: 300px">
      <router-view />
    </v-main>
  </v-layout>
</template>
