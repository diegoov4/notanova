<script setup>
import { ref, onMounted, toRef } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { useCommonStore } from '@/store/commonStore'
import { useClientStore } from '@/store/clienteStore'
import { useMesaStore } from '@/store/mesaStore'
import { useComandaStore } from '@/store/comandaStore'
import { useProductoStore } from '@/store/productoStore'

const emit = defineEmits(['comanda-saved', 'close'])

const authStore = useAuthStore()
const commonStore = useCommonStore()
const clientStore = useClientStore()
const mesaStore = useMesaStore()
const comandaStore = useComandaStore()
const productStore = useProductoStore()
const userMasterData = toRef(authStore, 'userMasterData')
const clientes = toRef(clientStore, 'clientes')
const mesas = toRef(mesaStore, 'mesas')
const productTypes = toRef(productStore, 'product_types')
const master_id = userMasterData.value.id_master
const created_by = userMasterData.value.responsable
const selectedCliente = ref(null)
const selectedMesa = ref(null)
const defaultMesa = ref(null)
const showCreateClientDialog = ref(false)
const showDropdown = ref(false)
const productosSeleccionados = ref([])
const showProductSelection = ref(false)
const optionsList = ref([])
const clientesList = ref([])
const mesasList = ref([])

const fetchClients = async () => {
  await clientStore.fetchClients(master_id)

  clientesList.value = clientes.value.map(cl => ({
    id: `${cl.id}`,
    title: `${cl.nombre}`,
  }))
  console.info('[ClientesList] ', clientesList)
}
const fetchMesas = async () => {
  // Obtenemos las mesas
  await mesaStore.fetchMesas(master_id)

  // Obtenemos la lista de mesas con formato para el select
  mesasList.value = mesas.value.map(cl => ({
    id: `${cl.id}`,
    title: `${cl.nombre}`,
  }))
  // Obtenemos la mesa por defecto para el select
  defaultMesa.value = mesas.value.find(mesa => mesa.default === true)
  selectedMesa.value = {
    id: defaultMesa.value ? parseInt(defaultMesa.value.id, 10) : 0, // 0 or ever default value
    title: defaultMesa.value ? `${defaultMesa.value.nombre}` : '',
  }

  console.info('[selectedMesa.value] ', selectedMesa.value)
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
  fetchMesas()
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

const selectMesa = mesa => {
  selectedMesa.value = mesa
  showDropdown.value = false
}

const showProducts = selectedProducts => {
  productosSeleccionados.value = selectedProducts
  showProductSelection.value = false
}

const saveComanda = async () => {
  if (!selectedCliente.value) {
    // || productosSeleccionados.value.length === 0
    alert('Por favor, seleccione al menos un cliente')
    return
  }

  // Create Comanda
  try {
    console.info('[selectedCliente] : ', selectedCliente.value)
    console.info('[selectedMesa] : ', selectedMesa.value)

    // Cuando creamos cliente y mesa nuevo viene como objeto. Nos quedamos con el ID
    if (typeof selectedCliente.value === 'object' && 'id' in selectedCliente.value) {
      selectedCliente.value = selectedCliente.value.id
    }
    if (typeof selectedMesa.value === 'object' && 'id' in selectedMesa.value) {
      selectedMesa.value = selectedMesa.value.id
    }

    // Si no se elige la mesa se pone siempre la de por defecto
    if (selectedMesa.value === null) {
      selectedMesa.value = 11
    }

    if (master_id) {
      await comandaStore.createComanda(
        selectedCliente.value,
        selectedMesa.value,
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
  selectedMesa.value = {
    id: `${defaultMesa.value.id}`,
    title: `${defaultMesa.value.nombre}`,
  }
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

      <!-- Selector -->
      <v-card-item>
        <!-- Row: Cliente y Mesa same line -->
        <template #default>
          <v-row no-gutters class="justify-center text-center">
            <!-- Clientes -->
            <v-col>
              <v-sheet class="ma-2 pa-2 select-resp">
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
                  v-model="selectedMesa"
                  :items="mesasList"
                  item-text="title"
                  item-value="id"
                  label="Mesa"
                  placeholder="Seleccione Mesa"
                  @change="selectMesa"
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

      <!-- Resumen productos seleccionados -->
      <v-list lines="two" class="overflow-y-auto mh-31">
        <v-list-item
          v-for="producto in productosSeleccionados"
          :key="producto.id"
          :value="producto.id"
          :title="producto.titulo"
          :subtitle="producto.cantidad"
          :prepend-avatar="producto.images.url"
        />
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
        <!-- </v-list-item> -->
      </v-list>

      <!-- Footer. Editar comanda y Productos -->
      <v-card-actions class="d-flex justify-space-between align-center">
        <v-btn
          variant="elevated"
          color="secondary"
          class="btn-main"
          :loading="showProductSelection"
          @click="showProductSelection = true"
        >
          <i-ph-shopping-cart-bold class="mr-2" />
          Productos
        </v-btn>

        <v-btn
          variant="elevated"
          color="primary"
          class="btn-main"
          :loading="showProductSelection"
          @click="saveComanda"
        >
          <i-mdi-content-save-edit-outline class="mr-2" />
          Crear
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
