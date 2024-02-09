<template>
  <div class="dialog-overlay" @click.self="resetDialog">
    <div class="dialog">
      <header class="dialog-header">
        <h3>Nueva Comanda</h3>
        <button class="close-button" @click="resetDialog">x</button>
      </header>
      <div class="dialog-body">

        <!-- Selector de cliente -->
        <div class="select-wrapper-client">
          <div class="select-display" @click="toggleDropdown">
            {{ selectedCliente?.nombre_cliente || 'Cliente' }}
            <span class="caret">&#9660;</span>
          </div>
          <ul v-if="showDropdown" class="dropdown">
            <li v-for="cliente in clientes" :key="cliente.id" @click="selectCliente(cliente)">
              {{ cliente.nombre_cliente }}
            </li>
          </ul>
          <button @click="showCreateClientDialog = true">+</button>
        </div>
        <CreateClientDialog v-if="showCreateClientDialog" @close="showCreateClientDialog = false" @clientCreated="fetchClients" />

        <!-- Lista de productos seleccionados -->
        <div class="selected-products">
          <div v-for="producto in productosSeleccionados" :key="producto.id" class="selected-product">
            <div class="product-image-container">
              <img :src="producto.imagen" :alt="producto.titulo" class="product-image" />
            </div>
            <div class="product-info">
              <div class="product-title">{{ producto.titulo }}</div>
              <div class="product-controls">
                <input type="number" min="0" v-model="producto.cantidad" class="product-quantity" />
                <button @click="removeProduct(producto)" class="remove-product-button"></button>
              </div>
            </div>
          </div>
        </div>

        <button class="button" @click="showProductSelection = true">Añadir Productos</button>

        <!-- Dialog para selección de productos -->
        <div class="product-dialog-container" v-if="showProductSelection">
          <ProductSelectionDialog @selectedProducts="showProducts" @close="showProductSelection = false" />
        </div>
      </div>
      <footer class="dialog-footer">
        <button class="button button-green" @click="saveComanda">Guardar Comanda</button>
      </footer>
    </div>
  </div>
</template>
  
<script>
import { ref, onMounted, toRef } from 'vue';
import { useCommonStore } from '@/store/commonStore';
import { useClientStore } from '@/store/clienteStore';
import { useComandaStore } from '@/store/comandaStore';
import CreateClientDialog from '@/components/CreateClientDialog.vue';
import ProductSelectionDialog from '@/components/ProductSelectionDialog.vue';

export default {
  components: {
    CreateClientDialog,
    ProductSelectionDialog
  },
  setup(_, { emit }) {
    const commonStore = useCommonStore();
    const clientStore = useClientStore();
    const comandaStore = useComandaStore();
    const clientes = toRef(clientStore,'clientes');
    const selectedCliente = ref(null);
    const showCreateClientDialog = ref(false);
    const showDropdown = ref(false);
    const productosSeleccionados = ref([]);
    const showProductSelection = ref(false);
    const error = ref('');

    const fetchClients = async () => {
      if (commonStore.getUserLocal && commonStore.getUserLocal.length > 0) {
        await clientStore.fetchClients(commonStore.getUserLocal[0].id);
      }
    };
    onMounted(fetchClients);

    const selectCliente = (cliente) => {
      selectedCliente.value = cliente;
      showDropdown.value = false;
    };

    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value;
    };

    const showProducts = (selectedProducts) => {
      productosSeleccionados.value = selectedProducts;
      showProductSelection.value = false;
    };

    const removeProduct = (producto) => {
      productosSeleccionados.value = productosSeleccionados.value.filter(p => p.id !== producto.id);
    };

    const saveComanda = async () => {
      error.value = '';

      //DMO: Quitar el tener un producto minimo, se podrán crear vacías
      if (!selectedCliente.value || productosSeleccionados.value.length === 0) {
        error.value = 'Por favor, seleccione un cliente y al menos un producto.';
        alert(error.value);
        return;
      }

      // Create Comanda
      try {
        if (commonStore.getUserLocal && commonStore.getUserLocal.length > 0) {
          await comandaStore.createComanda(selectedCliente.value, productosSeleccionados.value, commonStore.getUserLocal[0].id);

          emit('comanda-saved');
          resetDialog();
        } else {
          throw new Error('La información del local no está disponible.');
        }
      } catch (error) {
        console.error('Error al guardar la comanda:', error);
        error.value = error.message || 'Ocurrió un error desconocido.';
      }
    };

    // Restablecer estado y cerrar diálogo
    const resetDialog = () => {
      productosSeleccionados.value = [];
      selectedCliente.value = null;
      showProductSelection.value = false;
      commonStore.setShowNewComandaDialog(false);
      emit('close');
    };

    return {
      clientes,
      selectedCliente,
      showCreateClientDialog,
      toggleDropdown,
      showDropdown,
      selectCliente,
      fetchClients,
      productosSeleccionados,
      showProductSelection,
      error,
      showProducts,
      removeProduct,
      saveComanda,
      resetDialog,
    };
  }
};
</script>
  
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
  padding: .5rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.product-info {
  flex: 1;
  /* Toma el espacio restante */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.product-title {
  font-weight: bold;
  margin-bottom: 5px;
  /* Espacio entre el título y los controles */
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
  content: '✕';
  /* Puedes usar un icono de X aquí */
  color: red;
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
  