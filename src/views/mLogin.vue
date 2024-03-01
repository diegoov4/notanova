<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/services/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const error = ref('')
const loadingLogin = ref(false)
const pwdVisible = ref(false)

const handleLogin = async () => {
  loadingLogin.value = true
  const {
    data: { user },
    error: loginError,
  } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (loginError) {
    console.info('[LOGIN] Error: ', loginError.message)
    loadingLogin.value = false
    error.value = 'Error de credenciales'
  } else {
    // Persist auth_user by 'local'
    const isFetch = await authStore.fetchUserMasterData(user.email)
    if (isFetch) {
      authStore.setUser(user)
      // Redirect to Home
      router.push({ name: 'LandingHome' })
    }
  }
}
</script>

<template>
  <v-container>
    <v-card class="mx-auto pt-4 pb-14 rounded-lg" max-width="500">
      <v-card-title class="d-flex align-center mb-5">
        <v-avatar size="95" image="src/assets/header_logo2.png" />
        <span class="text-h3 text-uppercase text-grey-darken-3 ml-8">NotaNova</span>
      </v-card-title>

      <v-text-field v-model="email" class="ml-8 mr-8" label="Email" variant="outlined">
        <template #prepend-inner>
          <i-ph-envelope-duotone class="mr-2" />
        </template>
      </v-text-field>

      <v-text-field
        v-model="password"
        class="ml-8 mr-8"
        :type="pwdVisible ? 'text' : 'password'"
        label="Password"
        variant="outlined"
        @keyup.enter="handleLogin"
      >
        <template #prepend-inner>
          <i-mdi-password class="mr-2" />
        </template>

        <template #append-inner>
          <div @click="pwdVisible = !pwdVisible">
            <i-ph-eye-closed-bold v-if="!pwdVisible" class="ml-2" />
            <i-ph-eye-bold v-else class="ml-2" />
          </div>
        </template>
      </v-text-field>

      <v-alert v-if="error" type="error" :value="true" dismissible color="red-accent-4">
        {{ error }}
      </v-alert>

      <v-card-actions class="ml-8 mr-8">
        <v-btn
          block
          size="large"
          variant="elevated"
          color="primary"
          :loading="loadingLogin"
          @click="handleLogin"
        >
          LOG IN
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<!-- <template>
  <v-container class="fill-height" fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="5">
        <v-card class="elevation-12" outlined>
          <v-toolbar color="transparent" flat>
            <v-toolbar-title>Iniciar Sesión</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                required
                :rules="[v => !!v || 'E-mail es requerido']"
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Contraseña"
                type="password"
                required
                :rules="[v => !!v || 'Contraseña es requerida']"
              ></v-text-field>
              <v-alert v-if="error" type="error" :value="true" dismissible>
                {{ error }}
              </v-alert>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" type="submit" block>ACCEDER</v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template> -->
