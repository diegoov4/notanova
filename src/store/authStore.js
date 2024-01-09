import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null, // Almacenará los datos del usuario
  }),
  actions: {
    setUser(userData) {
      this.user = userData;
    },
    clearUser() {
      this.user = null;
    },
    // Aquí puedes añadir más acciones relacionadas con la autenticación
  },
});