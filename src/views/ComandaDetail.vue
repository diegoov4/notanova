<template>
    <div class="comanda-detail-container">
        <header>
            <!-- Cabecera con información del cliente -->
            <h2>{{ comanda?.clientes.nombre_cliente || 'Cliente Desconocido' }}</h2>
            <p>Total: {{ formatCurrency(comanda?.total) }}</p>
        </header>
        <ul class="pedido-list">
            <!-- Lista de pedidos -->
            <li v-for="pedido in comanda?.pedidos" :key="pedido.id" class="pedido-item">
                <span>{{ pedido.nombre_producto }}</span>
                <input type="number" v-model.number="pedido.cantidad" />
                <button @click="eliminarPedido(pedido.id)">X</button>
            </li>
        </ul>
        <footer>
            <!-- Botones de acción -->
            <button @click="cerrarComanda">Cerrar Comanda</button>
        </footer>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/services/supabase';

export default {
    name: 'ComandaDetail',
    setup() {
        const comanda = ref(null);
        const router = useRouter();
        const route = useRoute();

        onMounted(async () => {
            const { data, error } = await supabase
                .from('comandas')
                .select('*, clientes (*), mesas(*), locales_master(*)')
                .eq('id', route.params.id)
                .single();
            console.log(data);
            if (error) {
                console.error('Error al obtener detalles de la comanda:', error);
                return;
            }

            comanda.value = data;
        });

        const formatCurrency = (value) => {
            // Una función de utilidad para formatear el total como moneda
            if (value) {
                return new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                }).format(value);
            }
            return '';
        };

        const cerrarComanda = async () => {
            const { error } = await supabase
                .from('comandas')
                .update({ status: 'closed' })
                .eq('id', comanda.value.id);

            if (error) {
                console.error('Error al cerrar la comanda:', error);
                return;
            }

            // Redirigir al Home o actualizar la UI según sea necesario
            router.push({ name: 'LandingHome' });
        };

        const eliminarPedido = async (idProducto) => {
            //--Lógica para eliminar un pedido de la comanda--

            // Confirmación antes de eliminar
            if (!confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
                return;
            }

            const { data: pedidoEliminado, error } = await supabase
                .from('comandas_productos')
                .delete()
                .match({ id_comanda: comanda.value.id, id_producto: idProducto })
                .single();

            if (error) {
                console.error('Error al eliminar el pedido:', error);
                return;
            }

            // Eliminar el pedido de la lista en la interfaz de usuario
            comanda.value.pedidos = comanda.value.pedidos.filter(pedido => pedido.id !== pedidoEliminado.id_producto);

            // Recalcular el total (si la lógica de negocio lo requiere)
            // Esto asume que necesitas recalcular el total manualmente.
            // Si tu backend lo hace automáticamente, omitir este paso. DMO:Check
            comanda.value.total = comanda.value.pedidos.reduce((total, pedido) => {
                return total + pedido.precio * pedido.cantidad;
            }, 0);
        };

        return { comanda, cerrarComanda, eliminarPedido, formatCurrency };
    },
};
</script>
  
<style scoped>
.comanda-detail-container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 1rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

header {
    border-bottom: 1px solid #eee;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
}

h2 {
    color: #333;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
}

.pedido-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.pedido-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
}

.pedido-item:last-child {
    border-bottom: none;
}

.pedido-item span {
    flex-grow: 1;
}

.pedido-item input {
    width: 50px;
    padding: 0.5rem;
    margin: 0 1rem;
    text-align: center;
    border: 1px solid #ddd;
    border-radius: 4px;
}

button {
    background-color: #ff5252;
    border: none;
    padding: 0.5rem 1rem;
    color: white;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background-color: #ff7676;
}

footer {
    margin-top: 1rem;
    text-align: right;
}

footer button {
    background-color: #4caf50;
    border: none;
    padding: 0.5rem 1rem;
    color: white;
    border-radius: 4px;
    cursor: pointer;
}

footer button:hover {
    background-color: #66bb6a;
}
</style>