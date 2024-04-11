<script setup>
import { ref, onMounted, computed, toRef } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { useMesaStore } from '@/store/mesaStore'

const authStore = useAuthStore()
const mesaStore = useMesaStore()
const userMasterData = toRef(authStore, 'userMasterData')
const mesas = toRef(mesaStore, 'mesas')
const master_id = userMasterData.value.id_master
const showConfirmDialog = ref(false)
const mesaToDelete = ref(null)
const showMesaNueva = ref(false)
const titleToConfirmDialog = ref('')
const textToConfirmDialog = ref('')
// DMO: Doesnt work fine
// const holdTimer = ref(null)
// const holdDelay = 1000
const nuevaMesa = ref({
  nombre: '',
  default: false,
  forma: 'rectangular',
})

const mesaTypes = [
  { title: 'Redonda', value: 'redonda', class: 'round-table' },
  { title: 'Cuadrada', value: 'cuadrada', class: 'square-table' },
  { title: 'Rectangular', value: 'rectangular', class: 'rectangular-table' },
  { title: 'Ovalada', value: 'ovalada', class: 'oval-table' },
  { title: 'En forma de L', value: 'l', class: 'l-shaped-table' },
  { title: 'En forma de T', value: 't', class: 't-shaped-table' },
  { title: 'En forma de U', value: 'u', class: 'u-shaped-table' },
  { title: 'Esquinas recortadas', value: 'esquinas-recortadas', class: 'cut-corners-table' },
  { title: 'Hexagonal', value: 'hexagonal', class: 'hexagon-table' },
  { title: 'Octogonal', value: 'octogonal', class: 'octagon-table' },
]

const fetchMesas = async () => {
  await mesaStore.fetchMesas(master_id)
}
onMounted(fetchMesas)

// #########################
// Store Methods
// #########################

const deleteMesa = async () => {
  showConfirmDialog.value = false
  const isDelete = await mesaStore.deleteMesa(mesaToDelete.value.id)
  if (isDelete) {
    // Eliminar mesa de la lista
    mesas.value = mesas.value.filter(c => c.id !== mesaToDelete.value.id)
    mesaToDelete.value = null
  } else alert('No se ha podido borrar la Mesa') // Handle error
}

const agregarNuevaMesa = async () => {
  if (nuevaMesa.value.nombre) {
    const nuevaMesaCreado = await mesaStore.createMesa(nuevaMesa.value, master_id)
    if (nuevaMesaCreado) {
      mesas.value.push(nuevaMesaCreado)
      console.info('[Mesa]Mesas: ', mesas)
    }
    // Clean vars
    nuevaMesa.value = { nombre: '', default: false, forma: 'rectangular' }
    showMesaNueva.value = false
  } else {
    alert('Tiene que rellenar al menos el nombre de la Mesa')
  }
}

// #########################
// Prompts & Events
// #########################

const promptDeleteMesa = mesa => {
  mesaToDelete.value = mesa
  titleToConfirmDialog.value = `Eliminar ${mesa.nombre}`
  textToConfirmDialog.value = `¿Estás seguro de que deseas eliminar "${mesa.nombre}" de la comanda?`
  showConfirmDialog.value = true
}

const resetConfirmDialog = () => {
  mesaToDelete.value = null
  showConfirmDialog.value = false
}

// const onMousedown = mesa => {
//   holdTimer.value = setTimeout(() => {
//     promptDeleteMesa(mesa)
//   }, holdDelay)
// }

// -- en template Mesa
// @mousedown="onMousedown(mesa)"
// @mouseup="onMouseup"
// @mouseleave="onMouseup"

// const onMouseup = () => {
//   clearTimeout(holdTimer.value)
// }

// #########################
// Mesa Styles
// #########################

const getRandomColor = () => {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

const mesaStyles = computed(() => {
  return mesas.value.map(mesa => ({
    ...mesa,
    color: getRandomColor(),
    shapeClass: getShapeClass(mesa.forma),
  }))
})

// Assign class by 'forma'
const getShapeClass = shape => {
  const mesa = mesaTypes.find(m => m.value === shape)
  return mesa ? mesa.class : 'rectangular-table'
}
</script>

<template>
  <v-container>
    <!-- Hedaer (button create) -->
    <v-row class="crear-mesa-container">
      <v-col>
        <v-btn
          color="yellow-accent-2"
          class="btn-main font-weight-bold"
          @click="showMesaNueva = true"
        >
          <i-mdi-table-chair class="mr-2" />
          Crear Mesa
        </v-btn>
      </v-col>
    </v-row>
    <!-- Mesas -->
    <v-row>
      <v-col v-for="mesa in mesaStyles" :key="mesa.id" cols="12" sm="6" md="4" lg="3">
        <v-card
          :style="{ backgroundColor: mesa.color }"
          :class="mesa.shapeClass"
          class="d-flex flex-column align-center justify-center"
          height="200"
          @dblclick="promptDeleteMesa(mesa)"
        >
          <div :class="['mesa', mesa.shapeClass]" :style="{ '--mesa-color': mesa.color }">
            <span :class="['mesa-text', 'text-uppercase', `${mesa.shapeClass}-text`]">
              {{ mesa.nombre }}
            </span>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- Confirm Dialog -->
  <v-dialog v-model="showConfirmDialog" persistent max-width="300px">
    <v-card>
      <v-card-title class="text-h5">{{ titleToConfirmDialog }}</v-card-title>
      <v-card-text>{{ textToConfirmDialog }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error darken-1" class="btn-main" text @click="resetConfirmDialog">
          Cancelar
        </v-btn>
        <v-btn color="primary darken-1" class="btn-main" text @click="deleteMesa">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Formulario Nueva Mesa -->
  <v-dialog v-model="showMesaNueva" persistent max-width="300px">
    <v-card class="pa-4 mb-4 rounded-lg">
      <!-- Header -->
      <v-card-title class="d-flex justify-space-between align-center">
        Crear Nueva Mesa
        <i-ph-x-bold @click="showMesaNueva = false" />
      </v-card-title>

      <v-divider color="primary"></v-divider>

      <!-- Fields -->
      <v-card-text>
        <v-text-field v-model="nuevaMesa.nombre" clearable label="Nombre" variant="outlined" />
        <!-- select formas -->
        <v-select
          v-model="nuevaMesa.forma"
          label="Forma de la mesa"
          :items="mesaTypes"
          item-text="title"
          item-value="value"
        ></v-select>
      </v-card-text>

      <v-divider color="primary"></v-divider>

      <v-card-actions class="mt-2">
        <v-btn variant="elevated" class="btn-main" color="primary" @click="agregarNuevaMesa">
          Guardar
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn variant="elevated" class="btn-main" color="error" @click="showMesaNueva = false">
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.crear-mesa-container {
  position: relative;
  top: -10rem;
}

.crear-mesa-container .btn-main {
  position: absolute;
  right: 0;
}

/* button New Mesa responsive */
@media (max-width: 600px) {
  .crear-mesa-container {
    top: 0;
  }

  .crear-mesa-container .btn-main {
    position: static;
    margin: 0 auto; /* center */
  }
}
</style>
