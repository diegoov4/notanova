import { defineStore } from 'pinia';

export const useCommonStore = defineStore('common', {
    state: () => ({
        showNewComandaDialog: false,
    }),
    persist: {
        paths: ['showNewComandaDialog'],
      },
    getters: {
        isNewComandaDialogVisible: (state) => !!state.showNewComandaDialog,
    },
    actions: {
        setShowNewComandaDialog(value) {
            this.showNewComandaDialog = value;
        },
        clearData() {
            this.showNewComandaDialog = false;
        }
    },
})