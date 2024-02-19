<template>
  <transition name="fade" appear>
    <div class="dialog-overlay create-client-overlay" @click.self="close">
      <div class="dialog create-client-dialog">
        <header class="dialog-header">
          <h3>Nuevo Cliente</h3>
          <button class="close-button" @click="close">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>
        <div class="dialog-body">
          <input
            type="text"
            v-model="newClientName"
            placeholder="Nombre del cliente"
            class="input-client-name"
            @keyup.enter="addNewClient"
          />
          <button class="button button-green" @click="addNewClient">Crear</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, toRef } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { useClientStore } from '@/store/clienteStore'

export default {
  setup(_, { emit }) {
    const newClientName = ref('')
    const authStore = useAuthStore()
    const clientStore = useClientStore()
    const userMasterData = toRef(authStore, 'userMasterData')
    const master_id = userMasterData.value.id

    const addNewClient = async () => {
      if (!newClientName.value.trim()) {
        console.error('Por favor, ingresa un nombre para el cliente.')
        return
      }
      // Create Client
      try {
        if (master_id) {
          const clientCreated = await clientStore.createClient(newClientName.value, master_id)
          newClientName.value = ''

          emit('clientCreated', clientCreated)
          close()
        }
      } catch (error) {
        console.error('Error al crear cliente[DIALOG]:', error)
        alert('Hubo un error al crear el cliente.')
      }
    }

    const close = () => emit('close')

    return { newClientName, addNewClient, close }
  },
}
</script>

<style scoped>
.create-client-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  justify-content: center;
  align-items: center;
}

.create-client-dialog {
  z-index: 201;
}

.input-client-name {
  padding: 12px 16px;
  margin-bottom: 16px;
  box-sizing: border-box;
  border: 2px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.input-client-name:focus {
  border-color: #4caf50;
  outline: none;
}
</style>
