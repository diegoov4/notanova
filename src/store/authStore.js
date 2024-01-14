import { defineStore } from 'pinia';

const savedUser = localStorage.getItem('user')

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: savedUser ? JSON.parse(savedUser) : null, // Almacenará los datos del usuario
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    setUser(userData) {
      this.user = userData
      localStorage.setItem('user', JSON.stringify(this.user))
    },
    clearUser() {
      this.user = null
      localStorage.removeItem('user')
    },
    // Aquí puedes añadir más acciones relacionadas con la autenticación
  },
})