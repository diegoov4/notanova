<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/authStore'
import { useCommonStore } from '@/store/commonStore'
import { supabase } from '@/services/supabase'

const authStore = useAuthStore()
const commonStore = useCommonStore()
const router = useRouter()
const menuOpen = ref(false)

const openDialog = () => {
  goToLandingHome()
  commonStore.setShowNewComandaDialog(true)
}

const logout = async () => {
  menuOpen.value = false
  await supabase.auth.signOut()
  authStore.clearUser()
  commonStore.clearData()
  router.push({ name: 'mLogin' })
}

const goToLandingHome = () => {
  router.push({ name: 'LandingHome' })
}

const auth_user = authStore.auth_user
</script>

<template>
  <v-app-bar app>
    <template #prepend>
      <img
        src="@/assets/header_logo.png"
        alt="NotaNova Logo"
        class="home-button"
        style="max-height: 64px; max-width: 64px; cursor: pointer"
        @click="goToLandingHome"
      />
    </template>

    <v-app-bar-title class="ml-10">
      <v-btn variant="elevated" class="text-h6 text-uppercase" color="primary" @click="openDialog">
        <i-ph-plus-square-bold class="mr-1" />
        Comanda
      </v-btn>
    </v-app-bar-title>

    <!-- spacer to align right -->
    <v-spacer></v-spacer>

    <!-- Navigation links -->
    <v-btn text to="/productos">Productos</v-btn>
    <v-btn text to="/clientes">Clientes</v-btn>
    <v-btn text to="/mesas">Mesas</v-btn>

    <!-- User and logout -->
    <v-menu>
      <template #activator="{ props }">
        <v-btn text v-bind="props">
          {{ auth_user?.email }}
          <i-mdi-chevron-down />
        </v-btn>
      </template>

      <v-list>
        <v-list-item link :title="'Cerrar Sesión'" @click="logout">
          <template #append>
            <i-ph-sign-out-duotone class="text-error text-h6" />
          </template>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>
