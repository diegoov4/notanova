<template>
  <div class="dialog-overlay dialog-products-overlay" @click.self="close">
    <div class="dialog">
      <header class="dialog-header">
        <h3>Seleccionar Productos</h3>
        <button class="close-button" @click="close">X</button>
      </header>
      <ul class="products-picker">
        <li v-for="product in availableProducts" :key="product.id" class="product-item">
          <div class="product-image-container">
            <img :src="product.imagen" class="product-image" :alt="product.titulo" />
          </div>
          <div class="product-details">
            <div class="product-title">{{ product.titulo }} | <span class="price">{{
              formatCurrency(product.precio) }}</span></div>
            <div class="number-input">
              <button @click="decrement(product)">-</button>
              <input v-model.number="product.cantidad" min="0" type="number">
              <button @click="increment(product)">+</button>
            </div>
          </div>
        </li>
      </ul>
      <footer class="dialog-footer">
        <button class="button button-green" @click="confirmSelection">Confirmar</button>
      </footer>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, toRef } from 'vue';
import { useCommonStore } from '@/store/commonStore';
import { useProductoStore } from '@/store/productoStore';

export default {
  setup(_, { emit }) {
    const commonStore = useCommonStore();
    const productoStore = useProductoStore();
    const availableProducts = toRef(productoStore,'productos');
    const selectedProducts = ref([]);

    const formatCurrency = (value) => {
      if (value) {
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR',
        }).format(value);
      }
      return '';
    };

    const increment = (product) => {
      product.cantidad++;
    };
    const decrement = (product) => {
      if (product.cantidad > 0) {
        product.cantidad--;
      }
    };

    const fetchProductos = async () => {
      if (commonStore.getUserLocal && commonStore.getUserLocal.length > 0) {
        await productoStore.fetchProductos(commonStore.getUserLocal[0].id);
      } else {
        console.error('User local is not available or is not in the expected format');
      }
    };
    onMounted(fetchProductos);


    const confirmSelection = () => {
      const selected = availableProducts.value
        .filter((product) => product.cantidad > 0)
        .map((product) => ({
          id: product.id,
          titulo: product.titulo,
          imagen: product.imagen,
          cantidad: product.cantidad,
          precio: product.precio,
        }));

      console.log('Selected products:', selected);
      emit('selectedProducts', selected);
      close();
    };

    const close = () => emit('close');

    return {
      availableProducts,
      selectedProducts,
      confirmSelection,
      formatCurrency,
      increment,
      decrement,
      close
    };
  }
};
</script>
  
<style scoped>
.dialog-products-overlay {
  inset: 0;
  z-index: 101;
}

.products-picker {
  list-style-type: none;
  padding: 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
}

.products-picker li.product-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
  /* Una línea sutil para separar productos */
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.products-picker li.product-item label {
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.products-picker li.product-item input[type="checkbox"] {
  margin-right: 1rem;
}

.product-details {
  display: flex;
  flex-direction: column;
}

.product-title {
  font-weight: bold;
}
</style>
  