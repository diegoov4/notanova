<script setup>
import { ref, toRef } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { useClientStore } from '@/store/clienteStore'

const emit = defineEmits(['clientCreated', 'close'])

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
      // add title for Select
      clientCreated.title = clientCreated.nombre
      // crean input
      newClientName.value = ''
      // return clienteCreado
      emit('clientCreated', clientCreated)
      close()
    }
  } catch (error) {
    console.error('Error al crear cliente[DIALOG]:', error)
    alert('Hubo un error al crear el cliente.')
  }
}

const close = () => {
  newClientName.value = ''
  emit('close')
}
</script>

<template>
  <v-dialog max-width="500px" @click.self="close" @click:outside="close">
    <v-card>
      <v-card-title class="text-h5 d-flex justify-space-between align-center">
        Nuevo Cliente
        <i-ph-x-bold @click="close" />
      </v-card-title>

      <v-card-text>
        <v-text-field
          v-model="newClientName"
          label="Nombre del cliente"
          solo
          append-outer-icon="mdi-account-plus"
          @keyup.enter="addNewClient"
        ></v-text-field>
      </v-card-text>

      <v-card-actions>
        <v-btn variant="elevated" color="primary" class="pa-2 btn-main" @click="addNewClient">
          <i-ph-user-plus-duotone class="mr-2" />
          Crear
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
