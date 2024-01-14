<template>
  <div class="login-container">
    <h1>Iniciar Sesión</h1>
    <form @submit.prevent="handleLogin">
      <div class="field">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      <div class="field">
        <label for="password">Contraseña</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <div class="actions">
        <button type="submit" class="button is-primary">Acceder</button>
      </div>
      <!-- Mensajes de error o confirmación -->
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
  </div>
</template>
  
<script>
import { ref } from 'vue';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase';
import { useRouter } from 'vue-router'

export default {
  name: 'mLogin',
  setup() {
    const email = ref('');
    const password = ref('');
    const error = ref('');
    const authStore = useAuthStore();
    const router = useRouter()

    const handleLogin = async () => {
      const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      });

      if (loginError) {
        error.value = loginError.message;
      } else {
        authStore.setUser(user);
        router.push({ name: 'LandingHome' }); // Redirige al usuario a la página de inicio después del login
      }
    };

    return {
      email,
      password,
      error,
      handleLogin,
    };
  },
};
</script>
  
<style scoped>
.login-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.field {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.label {
  display: block;
  margin-bottom: 0.5rem;
}

.input {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.actions {
  margin-top: 1rem;
}

.button {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  color: white;
  background-color: var(--button-color, #333);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.button:hover {
  background-color: var(--button-hover-color, #555);
}

.error-message {
  color: var(--error-color, red);
  margin-top: 1rem;
}
</style>  