<template>
    <div class="dialog-overlay" @click.self="close">
        <div class="dialog">
            <header class="dialog-header">
                <h3>Nueva Comanda</h3>
                <button class="close-button" @click="close">×</button>
            </header>
            <div class="dialog-body">
                <!-- Selector de cliente -->
                <label for="cliente">Cliente:</label>
                <select v-model="selectedCliente" name="cliente">
                    <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">{{ cliente.nombre }}</option>
                </select>

                <!-- Lista de productos seleccionados -->
                <div class="selected-products">
                    <div v-for="producto in productosSeleccionados" :key="producto.id" class="selected-product">
                        <span>{{ producto.nombre }}</span>
                        <span>{{ formatCurrency(producto.precio) }}</span>
                        <button @click="removeProduct(producto)">Quitar</button>
                    </div>
                </div>

                <button class="add-product-button" @click="showProductSelection = true">Añadir Producto</button>

                <!-- Dialog para selección de productos -->
                <ProductSelectionDialog v-if="showProductSelection" @select="addProduct"
                    @close="showProductSelection = false" />
            </div>
            <footer class="dialog-footer">
                <button class="primary-button" @click="saveComanda">Guardar Comanda</button>
            </footer>
        </div>
    </div>
</template>
  
<script>
import { ref, onMounted } from 'vue';
import { supabase } from '@/services/supabase';
import ProductSelectionDialog from '@/components/ProductSelectionDialog.vue';

export default {
    components: {
        ProductSelectionDialog
    },
    setup() {
        const clientes = ref([]);
        const productosSeleccionados = ref([]);
        const selectedCliente = ref(null);
        const showProductSelection = ref(false);
        const loading = ref(false);
        const error = ref('');

        const formatCurrency = (value) => {
            if (value) {
                return new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                }).format(value);
            }
            return '';
        };

        // Cargar clientes de Supabase
        onMounted(async () => {
            const { data, error } = await supabase
                .from('clientes')
                .select('*');
            if (error) console.error('Error al cargar clientes:', error);
            else clientes.value = data;
        });

        const addProduct = (producto) => {
            productosSeleccionados.value.push(producto);
            showProductSelection.value = false;
        };

        const removeProduct = (producto) => {
            productosSeleccionados.value = productosSeleccionados.value.filter(p => p.id !== producto.id);
        };

        const saveComanda = async () => {
            loading.value = true;
            error.value = '';
            try {
                const { data: comanda, error: comandaError } = await supabase
                    .from('comandas')
                    .insert([{ /* datos de la comanda */ }]);
                if (comandaError) throw comandaError;

                for (const producto of productosSeleccionados.value) {
                    const { error: productError } = await supabase
                        .from('comandas_productos')
                        .insert([{ id_comanda: comanda[0].id, id_producto: producto.id, cantidad: 'X' }]);
                    if (productError) throw productError;
                }

                // Feedback de éxito
                alert('Comanda guardada con éxito');
            } catch (err) {
                error.value = 'Error al guardar la comanda: ' + err.message;
                console.error('Error al guardar la comanda:', err);
            } finally {
                loading.value = false;
                if (!error.value) {
                    resetDialog();
                }
            }
        };
        // Restablecer estado y cerrar diálogo
        const resetDialog = () => {
            productosSeleccionados.value = [];
            selectedCliente.value = null;
            showProductSelection.value = false;
            // Emitir un evento o realizar acciones adicionales para cerrar el diálogo
        };

        const close = () => {
            // Restablecer estado del diálogo al cerrar
            productosSeleccionados.value = [];
            selectedCliente.value = null;
        };

        return {
            clientes,
            productosSeleccionados,
            selectedCliente,
            showProductSelection,
            addProduct,
            removeProduct,
            loading,
            error,
            saveComanda,
            resetDialog,
            formatCurrency,
            close
        };
    }
};
</script>
  
<style scoped>

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: auto;
  max-width: 600px;
  padding: 1.5rem;
  margin: 1rem;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.dialog-header h3 {
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.selected-products {
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 0.5rem;
  max-height: 150px;
  overflow-y: auto;
}

.selected-product {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.5rem 0;
}

.add-product-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-product-button:hover {
  background-color: #45a049;
}

.primary-button {
  background-color: #008CBA;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.primary-button:hover {
  background-color: #007B9A;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
}

/* Responsive design adjustments */
@media (max-width: 768px) {
  .dialog {
    width: 90%;
  }
}
</style>
  