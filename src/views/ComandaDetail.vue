<template>
    <div class="comanda-detail-container">

        <!-- Cabecera Comanda -->
        <header class="comanda-header">
            <h2 class="comanda-title">{{ comanda?.clientes.nombre_cliente || 'Cliente Desconocido' }}</h2>
            <p class="comanda-total">Total:
                <span  @click="cerrarComanda" class="comanda-total-price">{{ formatCurrency(comanda?.total) || '0 €' }}</span>
            </p>
        </header>

        <!-- Listado de Productos -->
        <section class="pedido-section">
            <ul class="pedido-list">
                <li v-for="producto_b in comanda?.comandas_productos" :key="producto_b.id" class="pedido-item">
                    <div class="product-image-container">
                        <img :src="producto_b.producto.imagen" class="product-image" :alt="producto_b.producto.titulo" />
                    </div>
                    <div class="pedido-info">
                        <span class="pedido-nombre">{{ producto_b.producto.titulo }}</span>
                        <!-- <div class="quantity-controls">
                            <button @click="decrement(producto_b)" class="quantity-btn">-</button>
                            <input v-model.number="producto_b.cantidad" min="0" readonly>
                            <button @click="increment(producto_b)" class="quantity-btn">+</button>
                        </div> -->
                        <div class="number-input">
                            <button @click="decrement(producto_b)">-</button>
                            <input v-model.number="producto_b.cantidad" min="0" type="number">
                            <button @click="increment(producto_b)">+</button>
                        </div>
                    </div>
                    <button @click="eliminarProducto(producto_b.producto)" class="button button-red">×</button>
                </li>
            </ul>
        </section>
        
        <!-- Dialogo Selección Productos -->
        <div class="product-dialog-container" v-if="showProductSelection">
            <ProductSelectionDialog @selectedProducts="showProducts" @close="showProductSelection = false" />
        </div>

        <!-- Footer. Editar comanda y Cerrar (pagar) -->
        <footer class="comanda-footer">
            <div class="edit-buttons">
                <button @click="showProductSelection = true" class="button button-yellow">Productos</button>
                <button @click="updateComanda" class="button button-green">Guardar</button>
            </div>
            <!-- DMO: CAmbiar y poner como icono en la cabecera en pequeño a la dcha -->
            <!-- <button @click="cerrarComanda" class="button button-green">PAGAR</button> -->
            <button @click="goToLandingHome" class="button button-salir">Salir</button>
        </footer>
    </div>
</template>

<script>
import { ref, onMounted, toRef } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useComandaStore } from '@/store/comandaStore';
import ProductSelectionDialog from '@/components/ProductSelectionDialog.vue';

export default {
    name: 'ComandaDetail',
    components: {
        ProductSelectionDialog
    },
    setup() {
        const comandaStore = useComandaStore();
        const comanda = toRef(comandaStore, "comanda");
        const router = useRouter();
        const route = useRoute();
        const showProductSelection = ref(false);

        const increment = async (producto) => {
            producto.cantidad++;
            await comandaStore.updateProductQuantity(comanda.value.id, producto.producto.id, producto.cantidad);
            recalcularTotal();
        };

        const decrement = async (producto) => {
            if (producto.cantidad > 1) {
                producto.cantidad--;
                await comandaStore.updateProductQuantity(comanda.value.id, producto.producto.id, producto.cantidad);
                recalcularTotal();
            }
        };

        function recalcularTotal() {
            let total = 0;
            comanda.value.comandas_productos.forEach((item) => {
                total += item.cantidad * item.producto.precio;
            });
            comanda.value.total = total;
        }

        const showProducts = (selectedProducts) => {
            console.log('[STORE_showProducts]selectedProducts: ', selectedProducts);
            console.log('[STORE_showProducts]comanda.value.comandas_productos: ', comanda.value.comandas_productos);
            // Añadir productos seleccionados a la comanda existente
            selectedProducts.forEach(product => {
                let existingProduct = comanda.value.comandas_productos.find(p => p.producto.id === product.id);
                if (existingProduct) {
                    existingProduct.cantidad += product.cantidad;
                } else {
                    comanda.value.comandas_productos.push({
                        producto: product,
                        cantidad: product.cantidad,
                    });
                }
            });
            recalcularTotal();
            showProductSelection.value = false;

            // Actualizar la comanda en el backend con los nuevos productos
            console.log('Lista Productos a Actualizar: ', comanda.value.comandas_productos);
            comandaStore.updateProductsComanda(comanda.value.id, comanda.value.comandas_productos);
        };

        const fetchComandaById = async () => {
            if (route.params.id) {
                await comandaStore.fetchComandaById(route.params.id);
            } else {
                console.error('Invalid Param ID: ', route.params.id);
            }
        };
        onMounted(fetchComandaById);

        const formatCurrency = (value) => {
            if (value) {
                return new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                }).format(value);
            }
            return '';
        };

        const goToLandingHome = () => {
            router.push({ name: 'LandingHome' });
        }

        const cerrarComanda = async () => {
            //Primero confirmamos si quiere pagar
            if (!confirm(`¿Quieres cobrar y cerrar la comanda?`)) {
                return;
            }
            //Cerramos comanda
            const cerrado = await comandaStore.closeComanda(comanda.value.id);
            if (!cerrado) {
                alert('Ha habido un error al cerrar la comanda. Contacte con el administrador');
            }
            // Redirigir a la Home
            router.push({ name: 'LandingHome' });
        };

        const eliminarProducto = async (producto) => {
            console.log('EliminarProducto: ', producto)
            if (!confirm(`¿Estás seguro de que deseas eliminar "${producto.titulo}" de la comanda?`)) {
                return;
            }
            await comandaStore.deleteProducto(comanda.value.id, producto.id);
        };

        return { comanda, cerrarComanda, showProductSelection, goToLandingHome, showProducts, eliminarProducto, increment, decrement, formatCurrency };
    },
};
</script>

<style scoped>
.comanda-detail-container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 1rem;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.comanda-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1rem;
}

.comanda-title {
    font-size: 1.75rem;
    margin-right: auto;
    color: #333;
}

.comanda-total {
    font-size: 1.25rem;
    margin-left: auto;
    color: #333;
}

.comanda-total .comanda-total-price{
    cursor: pointer;
    font-weight: bold;
    font-size: 1.2rem;
}

.pedido-section {
    margin-bottom: 1rem;
}

.pedido-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.pedido-item {
    display: flex;
    align-items: center;
    margin: 1rem 0 1rem 0;
    background: #f9f9f9;
    border-radius: 8px;
    overflow: hidden;
}

.pedido-item .button-red{
    padding: 10px 18px;
}

.product-image-container {
    flex-shrink: 0;
}

.product-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
}

.pedido-info {
    padding: 0.5rem;
    flex-grow: 1;
}

.pedido-nombre {
    display: block;
    font-weight: bold;
    margin-bottom: 0.25rem;
}

.quantity-controls {
    display: flex;
    align-items: center;
}

.quantity-btn {
    border: none;
    background: #e0e0e0;
    padding: 0.25rem 0.5rem;
    margin: 0;
    cursor: pointer;
}


.comanda-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
}
/* Expandimos los botones por todo el footer */
/* .comanda-footer button {
    flex-grow: 1;
    margin: 0 5px;
} */
.comanda-footer .edit-buttons button{
    margin: 0 12px 0 0;
}
</style>