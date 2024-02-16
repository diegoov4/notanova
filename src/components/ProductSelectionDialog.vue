<template>
  <div class="dialog-overlay dialog-products-overlay" @click.self="close">
    <div class="dialog">
      <!-- Header -->
      <header class="dialog-header">
        <h3>Seleccionar Productos</h3>
        <button class="close-button" @click="close">X</button>
      </header>
      <!-- Filter Type -->
      <div class="filter-container">
        <v-select class="type-filter" :options="optionsList" v-model="selectedType" label="description" placeholder="Tipo de producto" />
      </div>
      <!-- Product Picker -->
      <ul class="products-picker">
        <li class="product-item" v-for="product in filteredProducts" :key="product.id">
          <div class="product-image-container">
            <img :src="product.images.url" class="product-image" :alt="product.titulo" />
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
import { ref, computed, onMounted, toRef } from 'vue';
// import { useAuthStore } from '@/store/authStore';
import { useProductoStore } from '@/store/productoStore';

export default {
  props: {
    optionsList: Array
  },
  setup(_, { emit }) {
    // const authStore         = useAuthStore();
    const productoStore     = useProductoStore();
    // const userMasterData    = toRef(authStore, "userMasterData");
    const availableProducts = toRef(productoStore,'productos');
    // const master_id         = userMasterData.value.id;
    const selectedType      = ref('');
    // const optionsList       = ref([]);
    const selectedProducts  = ref([]);


    // const fetchProductos = async () => {
    //   if (master_id) {
    //     await productoStore.fetchProductos(master_id);
    //     console.log['[availableProducts]', availableProducts];

    //     optionsList.value = availableProducts.value.map(type => ({
    //       value: type.id,
    //       description: `${type.categoria} > ${type.subcategoria}`
    //     }));
    //   } else {
    //     console.error('User Master ID is not available or is not in the expected format');
    //   }
    // };

    // Reset 'cantidad' to 0 for new products
    const resetCantidad = () => {
      availableProducts.value = availableProducts.value.map(product => ({
          ...product,
          cantidad: 0
      }));
    }
    onMounted(resetCantidad);


    const confirmSelection = () => {
      const selected = availableProducts.value
        .filter((product) => product.cantidad > 0)
        .map((product) => ({
          id: product.id,
          titulo: product.titulo,
          images: { url: product.images.url },
          cantidad: product.cantidad,
          precio: product.precio,
        }));

      console.log('Selected products:', selected);
      emit('selectedProducts', selected);
      close();
    };

    // Computed filter for image types
    const filteredProducts = computed(() => {
      if (selectedType.value) {
        return availableProducts.value.filter((producto) => {
          return producto.images.product_types.id === selectedType.value.value;
        });
      }
      return availableProducts.value;
    });

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

    const close = () => emit('close');

    return {
      availableProducts,
      selectedProducts,
      filteredProducts,
      // optionsList,
      selectedType,
      confirmSelection,
      formatCurrency,
      increment,
      decrement,
      close
    };
  }
};
</script>