<template>
    <div class="product-dialog-overlay" @click.self="close">
      <div class="product-dialog">
        <header class="product-dialog-header">
          <h3>Seleccionar Productos</h3>
        </header>
        <div class="product-dialog-body">
          <div v-for="producto in productos" :key="producto.id" class="product-item">
            <label :for="'product-' + producto.id">{{ producto.titulo }}</label>
            <input type="checkbox" :id="'product-' + producto.id" :value="producto" v-model="selectedProducts">
          </div>
        </div>
        <footer class="product-dialog-footer">
          <button @click="confirmSelection">Confirmar</button>
        </footer>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { supabase } from '@/services/supabase';
  
  export default {
    emits: ['select', 'close'],
    setup(_, { emit }) {
      const productos = ref([]);
      const selectedProducts = ref([]);
  
      onMounted(async () => {
        const { data, error } = await supabase
          .from('productos')
          .select('*');
        if (error) console.error('Error al cargar productos:', error);
        else productos.value = data;
      });
  
      const confirmSelection = () => {
        emit('select', selectedProducts.value);
        close();
      };
  
      const close = () => emit('close');
  
      return {
        productos,
        selectedProducts,
        confirmSelection,
        close
      };
    }
  };
  </script>
  
  <style scoped>
  /* Estilos para el diálogo de selección de productos */
  .product-dialog-overlay {
    /* ... */
  }
  
  .product-dialog {
    /* ... */
  }
  
  .product-item {
    /* ... */
  }
  </style>
  