<script setup>
import { ref, onMounted, toRef } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { useCommonStore } from '@/store/commonStore'
import { useClientStore } from '@/store/clienteStore'
import { useComandaStore } from '@/store/comandaStore'
import { useProductoStore } from '@/store/productoStore'
import CreateClientDialog from '@/components/CreateClientDialog.vue'
import ProductSelectionDialog from '@/components/ProductSelectionDialog.vue'

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

const fetchClients = async () => {
  await clientStore.fetchClients(master_id)
}
const fetchProductos = async () => {
  await productStore.fetchProductos(master_id)

  optionsList.value = productTypes.value.map(type => ({
    value: type.id,
    description: `${type.categoria} > ${type.subcategoria}`,
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

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const showProducts = selectedProducts => {
  productosSeleccionados.value = selectedProducts
  showProductSelection.value = false
}

const removeProduct = producto => {
  productosSeleccionados.value = productosSeleccionados.value.filter(p => p.id !== producto.id)
}

const saveComanda = async () => {
  // DMO: remove at least 1 product
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
  <div class="dialog-overlay" @click.self="resetDialog">
    <div class="dialog">
      <header class="dialog-header">
        <h3>Nueva Comanda</h3>
        <button class="close-button" @click="resetDialog">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </header>
      <div class="dialog-body">
        <!-- Selector de cliente -->
        <div class="select-wrapper-client">
          <div class="select-display" @click="toggleDropdown">
            {{ selectedCliente?.nombre || 'Cliente' }}
            <i class="fa-solid fa-caret-down caret"></i>
          </div>
          <ul v-if="showDropdown" class="dropdown">
            <li v-if="clientes.length === 0" @click="selectCliente('Cliente')">[Sin clientes]</li>
            <li
              v-else
              v-for="cliente in clientes"
              :key="cliente.id"
              @click="selectCliente(cliente)"
            >
              {{ cliente.nombre }}
            </li>
          </ul>

          <button @click="showCreateClientDialog = true">
            <i class="fa-solid fa-plus fa-xs"></i>
          </button>
        </div>
        <CreateClientDialog
          v-if="showCreateClientDialog"
          @close="showCreateClientDialog = false"
          @clientCreated="clientCreated"
        />

        <!-- Lista de productos seleccionados -->
        <div class="selected-products">
          <div
            v-for="producto in productosSeleccionados"
            :key="producto.id"
            class="selected-product"
          >
            <div class="product-image-container">
              <img :src="producto.images.url" :alt="producto.titulo" class="product-image" />
            </div>
            <div class="product-info">
              <div class="product-title">{{ producto.titulo }}</div>
              <div class="product-controls">
                <input type="number" min="0" v-model="producto.cantidad" class="product-quantity" />
                <button @click="removeProduct(producto)" class="remove-product-button">
                  <i class="fas fa-trash-alt fa-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <button class="button" @click="showProductSelection = true">Añadir Productos</button>

        <!-- Dialog para selección de productos -->
        <div class="product-dialog-container" v-if="showProductSelection">
          <ProductSelectionDialog
            :options-list="optionsList"
            @selectedProducts="showProducts"
            @close="showProductSelection = false"
          />
        </div>
      </div>
      <footer class="dialog-footer">
        <button class="button button-green" @click="saveComanda">Guardar Comanda</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.product-dialog-container {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 90rem;
  transform: translateX(-50%);
  z-index: 105;
}

.selected-products {
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 0.5rem;
  max-height: 150px;
  overflow-y: auto;
  margin-top: 10px;
}

.selected-product {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  background: #fff;
  padding: 0.5rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.product-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.product-controls {
  display: flex;
  align-items: center;
}

.remove-product-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  margin-left: 1rem;
}

.remove-product-button:before {
  font-weight: bold;
  font-size: 1.2rem;
}

.select-wrapper-client {
  display: flex;
  align-items: center;
  padding: 5px;
  border-radius: 25px;
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

.select-wrapper-client button {
  padding: 8px 16px;
  border-radius: 25px;
  border: none;
  cursor: pointer;
  background-color: #f0f0f0;
  color: #007651;
  margin-left: 10px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
}

.select-display {
  flex-grow: 1;
  padding: 10px;
  color: white;
  cursor: pointer;
  background-color: #fff;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.dropdown {
  position: absolute;
  background-color: white;
  list-style-type: none;
  padding: 0;
  margin: 0;
  width: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 0 0 25px 25px;
  z-index: 10;
}

.dropdown li {
  padding: 10px;
  cursor: pointer;
  border-radius: 25px;
  background-color: #f0f0f0;
}

.dropdown li:hover {
  background-color: #007651b0;
  color: white;
}

.caret {
  float: right;
  margin-left: 4px;
}
</style>
