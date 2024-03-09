<script setup>
import { ref, onMounted, computed, toRef } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { useMesaStore } from '@/store/mesaStore'

const authStore = useAuthStore()
const mesaStore = useMesaStore()
const userMasterData = toRef(authStore, 'userMasterData')
const mesas = toRef(mesaStore, 'mesas')
const master_id = userMasterData.value.id
const showConfirmDialog = ref(false)
const mesaToDelete = ref(null)
const titleToConfirmDialog = ref('')
const textToConfirmDialog = ref('')

const fetchMesas = async () => {
  await mesaStore.fetchMesas(master_id)
}
onMounted(fetchMesas)

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
    // add more propperties (p.e forma de la mesa)
  }))
})

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

const deleteMesa = async () => {
  showConfirmDialog.value = false
  const isDelete = await mesaStore.deleteMesa(mesaToDelete.value.id)
  if (isDelete) {
    // Eliminar mesae de la lista
    mesas.value = mesas.value.filter(c => c.id !== mesaToDelete.value.id)
    mesaToDelete.value = null
  } else alert('No se ha podido borrar la Mesa') // Handle error
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col v-for="mesa in mesaStyles" :key="mesa.id" cols="12" sm="6" md="4" lg="3">
        <v-card
          :style="{ backgroundColor: mesa.color }"
          class="d-flex flex-column align-center justify-center"
          height="200"
          @click="promptDeleteMesa(mesa)"
        >
          <div class="text-h5 text-white">{{ mesa.nombre }}</div>
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
</template>
