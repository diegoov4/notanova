<script setup>
import { ref, onMounted, toRef } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { useCommonStore } from '@/store/commonStore'
import { useClientStore } from '@/store/clienteStore'
import { useComandaStore } from '@/store/comandaStore'
import { useProductoStore } from '@/store/productoStore'

const emit = defineEmits(['comanda-saved', 'close'])

const authStore = useAuthStore()
const commonStore = useCommonStore()
const clientStore = useClientStore()
const comandaStore = useComandaStore()
const productStore = useProductoStore()
const userMasterData = toRef(authStore, 'userMasterData')
const clientes = toRef(clientStore, 'clientes')
const productTypes = toRef(productStore, 'product_types')
const master_id = userMasterData.value.id
const created_by = userMasterData.value.responsable
const selectedCliente = ref(null)
const showCreateClientDialog = ref(false)
const showDropdown = ref(false)
const productosSeleccionados = ref([])
const showProductSelection = ref(false)
const optionsList = ref([])
const clientesList = ref([])

const fetchClients = async () => {
  await clientStore.fetchClients(master_id)

  clientesList.value = clientes.value.map(cl => ({
    id: `${cl.id}`,
    title: `${cl.nombre}`,
  }))
  console.log('[ClientesList] ', clientesList)
}
const fetchProductos = async () => {
  await productStore.fetchProductos(master_id)

  optionsList.value = productTypes.value.map(type => ({
    id: `${type.id}`,
    title: `${type.categoria} > ${type.subcategoria}`,
  }))
}
onMounted(() => {
  fetchClients()
  fetchProductos()
})

const clientCreated = cliente => {
  selectedCliente.value = cliente
  fetchClients()
}

const selectCliente = cliente => {
  selectedCliente.value = cliente
  showDropdown.value = false
}

const showProducts = selectedProducts => {
  productosSeleccionados.value = selectedProducts
  showProductSelection.value = false
}

// const removeProduct = producto => {
//   productosSeleccionados.value = productosSeleccionados.value.filter(p => p.id !== producto.id)
// }

const saveComanda = async () => {
  if (!selectedCliente.value) {
    // || productosSeleccionados.value.length === 0
    alert('Por favor, seleccione al menos un cliente')
    return
  }

  // Create Comanda
  try {
    if (master_id) {
      await comandaStore.createComanda(
        selectedCliente.value,
        productosSeleccionados.value,
        created_by,
        master_id
      )

      emit('comanda-saved')
      resetDialog()
    } else {
      throw new Error('La información del local no está disponible.')
    }
  } catch (error) {
    console.error('Error al guardar la comanda:', error)
    error.value = error.message || 'Ocurrió un error desconocido.'
  }
}

// Restablecer estado y cerrar diálogo
const resetDialog = () => {
  productosSeleccionados.value = []
  selectedCliente.value = null
  showProductSelection.value = false
  commonStore.setShowNewComandaDialog(false)
  emit('close')
}
</script>

<template>
  <v-dialog persistent max-width="600px" @click:outside="resetDialog">
    <v-card class="pa-4 mb-4 rounded-lg">
      <!-- Header -->
      <v-card-title class="text-h5 d-flex justify-space-between align-center">
        Nueva Comanda
        <i-ph-x-bold @click="resetDialog" />
      </v-card-title>

      <!-- <v-divider :thickness="1" color="primary"></v-divider> -->

      <!-- Selector-->
      <v-card-item>
        <!-- Row: Cliente y Mesa same line -->
        <template #default>
          <v-row no-gutters class="justify-center text-center">
            <!-- Clientes -->
            <v-col>
              <v-sheet class="ma-2 pa-2">
                <v-select
                  v-model="selectedCliente"
                  :items="clientesList"
                  item-text="title"
                  item-value="id"
                  label="Cliente"
                  placeholder="Seleccione Cliente"
                  @change="selectCliente"
                ></v-select>
              </v-sheet>
            </v-col>

            <!-- Mesa -->
            <v-col>
              <v-sheet class="ma-2 pa-2">
                <v-select
                  v-model="selectedCliente"
                  :items="clientesList"
                  item-text="title"
                  item-value="id"
                  label="Mesa"
                  placeholder="Seleccione Mesa"
                  @change="selectCliente"
                ></v-select>
              </v-sheet>
            </v-col>
          </v-row>
        </template>
        <!-- Crear cliente -->
        <template #append>
          <v-btn
            icon
            color="primary"
            class="mb-5"
            :loading="showCreateClientDialog"
            @click="showCreateClientDialog = true"
          >
            <i-ph-user-plus-duotone />
          </v-btn>
        </template>
      </v-card-item>

      <v-divider :thickness="2" color="primary"></v-divider>

      <!-- Lista de productos seleccionados -->
      <v-list lines="two" class="overflow-y-auto mh-31">
        <v-list-item
          v-for="producto in productosSeleccionados"
          :key="producto.id"
          :value="producto.id"
          :title="producto.titulo"
          :subtitle="producto.cantidad"
          :prepend-avatar="producto.images.url"
        >
          <!-- Image Product -->
          <!-- <template #prepend>
            <v-avatar size="80" :image="producto.images.url" />
          </template> -->
          <!-- Desc. Product -->
          <!-- <template #title>
            {{ producto.titulo }}
          </template> -->
          <!-- Cantidad -->
          <!-- <template #subtitle>
            <div class="selector-cantidad pl-6">
            <v-text-field variant="plain">
              {{ producto.cantidad }}
            </v-text-field>
            </div>
          </template> -->
        </v-list-item>
      </v-list>

      <!-- Footer. Editar comanda y Productos -->
      <v-card-actions class="d-flex justify-space-between align-center">
        <v-btn
          variant="elevated"
          color="secondary"
          :loading="showProductSelection"
          @click="showProductSelection = true"
        >
          <i-ph-shopping-cart-bold class="mr-2" />
          Productos
        </v-btn>

        <v-btn
          variant="elevated"
          color="primary"
          class="pa-2"
          :loading="showProductSelection"
          @click="saveComanda"
        >
          <i-mdi-content-save-edit-outline class="mr-2" />
          Crear Comanda
        </v-btn>
      </v-card-actions>

      <!-- Dialogo Selección Productos -->
      <ProductSelectionDialog
        v-model="showProductSelection"
        :options-list="optionsList"
        @selected-products="showProducts"
        @close="showProductSelection = false"
      />

      <!-- Dialogo Clientes -->
      <CreateClientDialog
        v-model="showCreateClientDialog"
        @client-created="clientCreated"
        @close="showCreateClientDialog = false"
      />
    </v-card>
  </v-dialog>
</template>
