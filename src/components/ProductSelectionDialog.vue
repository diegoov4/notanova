<template>
  <div class="dialog-overlay dialog-products-overlay" @click.self="close">
    <div class="dialog">
      <header class="dialog-header">
        <h3>Seleccionar Productos</h3>
        <button class="close-button" @click="close">X</button>
      </header>
      <ul class="products-picker">
        <li class="product-item" v-for="product in availableProducts" :key="product.id">
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
import { useAuthStore } from '@/store/authStore';
import { useProductoStore } from '@/store/productoStore';

export default {
  setup(_, { emit }) {
    const authStore         = useAuthStore();
    const productoStore     = useProductoStore();
    const userMasterData    = toRef(authStore, "userMasterData");
    const availableProducts = toRef(productoStore,'productos');
    const master_id         = userMasterData.value.id;
    const selectedProducts  = ref([]);

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
      if (master_id) {
        await productoStore.fetchProductos(master_id);
      } else {
        console.error('User Master ID is not available or is not in the expected format');
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