<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/services/supabase'
import { useRouter } from 'vue-router'
import headerLogo from '@/assets/header_logo2.png'

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
        <v-avatar class="responsive-avatar" :image="headerLogo" />
        <span class="text-h3 text-uppercase text-grey-darken-3 ml-8 d-none d-sm-flex">
          NotaNova
        </span>
        <span class="text-h5 text-uppercase text-grey-darken-3 ml-8 d-sm-none">NotaNova</span>
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
          class="text-uppercase"
          :loading="loadingLogin"
          @click="handleLogin"
        >
          LoG In
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<style scoped>
.responsive-avatar {
  width: 95px;
  height: 95px;
}

@media (max-width: 600px) {
  .responsive-avatar {
    width: 60px;
    height: 60px;
  }
}
</style>
