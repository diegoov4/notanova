<script setup>
import { ref, onMounted, toRef } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { useClientStore } from '@/store/clienteStore'

const authStore = useAuthStore()
const clientStore = useClientStore()
const userMasterData = toRef(authStore, 'userMasterData')
const clientes = toRef(clientStore, 'clientes')
const master_id = userMasterData.value.id
const showConfirmDialog = ref(false)
const clientToDelete = ref(null)

const fetchClients = async () => {
  await clientStore.fetchClients(master_id)
}
onMounted(fetchClients)

const updateCliente = async cliente => {
  try {
    await clientStore.updateClient(cliente)
    alert('Cliente Actualizado')
  } catch (error) {
    console.error('Hubo un error al actualizar el Cliente:', error)
    alert('No se pudo actualizar el Cliente, revise los datos')
    // alert(error)
  }
}

const promptDeleteCliente = cliente => {
  clientToDelete.value = cliente
  showConfirmDialog.value = true
}

const deleteCliente = async () => {
  showConfirmDialog.value = false
  const isDelete = await clientStore.deleteCliente(clientToDelete.value.id)
  if (isDelete) {
    // Eliminar cliente de la lista
    clientes.value = clientes.value.filter(c => c.id !== clientToDelete.value.id)
    clientToDelete.value = null
  } else alert('No se ha podido borrar el cliente porque tiene comandas asignadas') // Handle error
}
</script>

<template>
  <v-container>
    <v-card class="pa-4 mb-4 rounded-lg">
      <!-- Header -->
      <v-card-title class="d-flex justify-space-between align-center mb-5">
        <span class="text-h4 text-primary font-weight-bold text-uppercase d-none d-sm-flex">
          Clientes
        </span>
        <span class="text-h5 text-primary font-weight-bold text-uppercase d-sm-none">Clientes</span>
      </v-card-title>

      <v-divider color="primary" :thickness="3"></v-divider>

      <!-- Listado de Clientes -->
      <v-list lines="two" class="overflow-y-auto mh-60 mt-6">
        <v-list-item v-for="cliente in clientes" :key="cliente.id">
          <!-- Client avatar (standard) -->
          <template #prepend>
            <!-- <v-avatar size="70" image="@/assets/header_logo.png" alt="cliente" /> -->
            <v-btn icon class="mr-6" color="grey">
              <i-mdi-card-account-details />
            </v-btn>
          </template>
          <!-- Nombre Cliente -->
          <template #title>
            <span
              class="text-uppercase text-h5 text-grey-darken-3 font-weight-bold text-capitalize"
            >
              {{ cliente.nombre }}
            </span>
          </template>

          <!-- Datos de Cliente -->
          <v-text-field v-model="cliente.phone" placeholder="Telefono (+34)"></v-text-field>
          <v-text-field v-model="cliente.email" placeholder="Email"></v-text-field>

          <!-- Delete Client -->
          <template #append>
            <v-btn stacked size="55" class="ml-16" color="primary" @click="updateCliente(cliente)">
              <i-mdi-content-save-edit-outline />
            </v-btn>
            <v-btn
              stacked
              size="55"
              class="ml-16"
              color="error"
              @click="promptDeleteCliente(cliente)"
            >
              <i-ph-trash-duotone />
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
      <!-- Confirm Dialog -->
      <v-dialog v-model="showConfirmDialog" persistent max-width="300px">
        <v-card>
          <v-card-title class="text-h5">Eliminar cliente</v-card-title>
          <v-card-text>¿Seguro que deseas eliminar el cliente seleccionado?</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error darken-1" class="btn-main" text @click="showConfirmDialog = false">
              Cancelar
            </v-btn>
            <v-btn color="primary darken-1" class="btn-main" text @click="deleteCliente">
              Confirmar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-container>
</template>
