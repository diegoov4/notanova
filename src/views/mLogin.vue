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

const handleLogin = async () => {
  const {
    data: { user },
    error: loginError,
  } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (loginError) {
    console.info('[LOGIN] Error: ', loginError.message)
    error.value = 'Error de credenciales'
  } else {
    // Persist auth_user by 'local'
    const isFetch = await authStore.fetchUserMasterData(user.email)
    if (isFetch) {
      authStore.setUser(user)
      // Redirigimos al inicio
      router.push({ name: 'LandingHome' })
    }
  }
}
</script>

<template>
  <div class="login-container">
    <h1 class="title">Iniciar Sesión</h1>
    <form @submit.prevent="handleLogin">
      <div class="field">
        <input id="email" v-model="email" type="email" required placeholder="Email" />
      </div>
      <div class="field">
        <input id="password" v-model="password" type="password" required placeholder="Contraseña" />
      </div>
      <div class="actions">
        <button type="submit" class="button button-green">ACCEDER</button>
      </div>
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 6rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #ccc;
}

.title {
  margin-bottom: 2rem;
  color: #333;
  font-size: 2rem;
  font-weight: 300;
}

.field {
  width: 100%;
  margin-bottom: 1.5rem;
}

.field input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  transition: border-color 0.3s;
}

.field input:focus {
  outline: none;
  border-color: #be8745;
  box-shadow: 0 0 0 2px rgba(190, 135, 69, 0.2);
}

.actions {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
