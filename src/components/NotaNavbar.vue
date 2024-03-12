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
      <!-- ############################ -->
      <!-- Botón del menú "hamburger" para pantallas pequeñas -->
      <!-- ############################ -->
      <v-menu class="d-md-none">
        <template #activator="{ props }">
          <v-btn text v-bind="props" class="d-md-none">
            <i-ph-list-bold class="text-h6" />
          </v-btn>
        </template>

        <v-list>
          <v-list-item
            link
            to="/"
            title="Crear Comanda"
            color="primary"
            class="bg-primary"
            @click="openDialog"
          >
            <template #prepend>
              <i-ph-plus-square-bold class="mr-2 text-white text-h6" />
            </template>
          </v-list-item>
          <v-list-item link to="/clientes" title="Clientes">
            <template #prepend>
              <i-mdi-account-supervisor class="mr-2 text-h6" />
            </template>
          </v-list-item>
          <v-list-item link to="/mesas" title="Mesas">
            <template #prepend>
              <i-mdi-table-picnic class="mr-2 text-h6" />
            </template>
          </v-list-item>
          <v-list-item link to="/informes" title="Informes">
            <template #prepend>
              <i-ph-file-cloud-bold class="mr-2 text-h6" />
            </template>
          </v-list-item>
          <v-list-item link to="/productos" title="Productos">
            <template #prepend>
              <i-ph-list-magnifying-glass-bold class="mr-2 text-h6" />
            </template>
          </v-list-item>
        </v-list>
      </v-menu>

      <img
        src="@/assets/header_logo.png"
        alt="NotaNova Logo"
        class="home-button"
        style="max-height: 64px; max-width: 64px; cursor: pointer"
        @click="goToLandingHome"
      />
    </template>

    <v-app-bar-title class="ml-10 d-none d-md-flex">
      <v-btn variant="elevated" class="text-h6 text-uppercase" color="primary" @click="openDialog">
        <i-ph-plus-square-bold class="mr-1" />
        Comanda
      </v-btn>
    </v-app-bar-title>

    <!-- spacer to align right -->
    <v-spacer></v-spacer>

    <!-- Button in big screens  -->
    <v-btn text class="d-none d-md-flex" to="/clientes">
      <!-- <i-mdi-account-supervisor class="mr-2 text-h6" /> -->
      Clientes
    </v-btn>
    <v-btn text class="d-none d-md-flex" to="/mesas">
      <!-- <i-mdi-table-picnic class="mr-2 text-h6" /> -->
      Mesas
    </v-btn>
    <v-btn text class="d-none d-md-flex" to="/informes">
      <!-- <i-ph-file-cloud-bold class="mr-2 text-h6" /> -->
      Informes
    </v-btn>
    <v-btn text class="d-none d-md-flex" to="/productos">
      <!-- <i-ph-list-magnifying-glass-bold class="mr-2 text-h6" /> -->
      Productos
    </v-btn>

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
            <i-ph-sign-out-duotone class="ml-1 text-error text-h6" />
          </template>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>
