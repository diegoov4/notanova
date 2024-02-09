import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
  }),
  persist: {
    paths: ['user'],
  },
  getters: {
    isAuthenticated: (state) => !!state.user
  },
  actions: {
    setUser(userData) {
      this.user = userData
    },
    clearUser() {
      this.user = null
    }
  },
})