<script setup>
import { useDisplay } from 'vuetify'
import { ref, toRef, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { useComandaStore } from '@/store/comandaStore'
import { useProductoStore } from '@/store/productoStore'
import { startOfMonth, endOfMonth, format } from 'date-fns'

const { smAndDown } = useDisplay()
const authStore = useAuthStore()
const comandaStore = useComandaStore()
const productosStore = useProductoStore()
const userMasterData = toRef(authStore, 'userMasterData')
const master_id = userMasterData.value.id_master
const comandas = toRef(comandaStore, 'comandas')
const productTypes = toRef(productosStore, 'product_types')
const optionsList = ref([])
const selectedType = ref('')
const search = ref('')
const itemsPerPage = 12
// date pickers - Current Month Default
const startDate = ref(startOfMonth(new Date()))
const endDate = ref(endOfMonth(new Date()))

// Report HEADERS
const headers = ref([
  { title: 'Producto', align: 'start', sortable: true, key: 'titulo' },
  { title: 'Cantidad Total', align: 'start', sortable: true, key: 'totalUsado' },
])

const fetchProductos = async () => {
  selectedType.value = ''
  if (master_id) {
    await productosStore.fetchProductos(master_id)

    optionsList.value = productTypes.value.map(type => ({
      id: `${type.id}`,
      title: `${type.categoria} > ${type.subcategoria}`,
    }))
  }
}

// Get all Comandas (without status) & Products
onMounted(async () => {
  await comandaStore.fetchComandas(master_id)
  fetchProductos()
})

const filterProductsOnComandasByDateRange = computed(() => {
  if (!comandas.value) return []

  // 1 - Filter on Comandas by current month
  const filteredComandas = comandas.value.filter(comanda => {
    const createdAt = new Date(comanda.created_at).getTime()
    return createdAt >= startDate.value.getTime() && createdAt <= endDate.value.getTime()
  })
  // 2 - Get Products directly by filtered Comandas
  const productUsage = {}
  filteredComandas.forEach(comanda => {
    comanda.comandas_productos.forEach(({ cantidad, producto }) => {
      if (!productUsage[producto.id]) {
        productUsage[producto.id] = {
          titulo: producto.titulo,
          images: producto.images,
          totalUsado: 0,
        }
      }
      productUsage[producto.id].totalUsado += cantidad
    })
  })
  // console.info('PRODUCTOS COMANDAS FILTRADOS: ', productUsage)
  return Object.values(productUsage)
})

const formatDate = date => {
  return format(date, 'dd/MM/yyyy')
}

const formattedStartDate = computed(() => {
  return startDate.value ? formatDate(startDate.value, false) : ''
})

const formattedEndDate = computed(() => {
  return endDate.value ? formatDate(endDate.value, false) : ''
})

const removeHeader = key => {
  headers.value = headers.value.filter(header => header.key !== key)
}

const resetFilters = () => {
  search.value = ''
  selectedType.value = ''
  // DMO: No borrar nunca el filtrado de meses
  // startDate.value = null
  // endDate.value = null
}

// Filter by 'Search' and Date Range
const filteredProducts = computed(() => {
  // 1 - check selectedType
  let productosFiltradosPorTipo = filterProductsOnComandasByDateRange.value
  if (selectedType.value) {
    productosFiltradosPorTipo = productosFiltradosPorTipo.filter(producto => {
      return producto.images.product_types.id === parseInt(selectedType.value, 10)
    })
  }

  // 2 - (and first of all) search by input Search
  const filteredBySearch = productosFiltradosPorTipo.filter(product =>
    product.titulo.toLowerCase().includes(search.value.toLowerCase())
  )

  return filteredBySearch
})
</script>

<template>
  <v-container>
    <v-card class="pa-4 mb-4 rounded-lg">
      <!-- Header -->
      <v-card-title class="d-flex align-center justify-space-between mb-5">
        <i-ph-currency-circle-dollar />
        <span
          :class="[
            'text-primary',
            'font-weight-bold',
            'text-capitalize',
            'font-italic',
            smAndDown ? 'text-button ml-2' : 'text-h6 ml-3',
          ]"
        >
          Reporte de Inventario
        </span>
        <i-ph-pencil-simple-slash-duotone
          class="text-h5 cursor-pointer text-red-lighten-2 ml-6 pt-1"
          @click="resetFilters"
        />
      </v-card-title>

      <v-divider color="primary" :thickness="3"></v-divider>

      <!-- Filters: Search -->
      <v-text-field v-model="search" label="Buscar" solo>
        <template #prepend-inner>
          <i-ph-magnifying-glass-bold />
        </template>
      </v-text-field>

      <!-- Filters: Product Type -->
      <v-select
        v-model="selectedType"
        :items="optionsList"
        item-text="title"
        item-value="id"
        label="Tipo de producto"
        placeholder="Seleccione tipo"
      />

      <!-- Filters: Date Range created_at -->
      <v-row>
        <v-col cols="12" md="6">
          <v-menu transition="scale-transition" offset-y :close-on-content-click="false">
            <template #activator="{ props }">
              <v-text-field
                v-model="formattedStartDate"
                label="Comandas desde"
                readonly
                v-bind="props"
              >
                <template #prepend-inner>
                  <i-ph-calendar-duotone />
                </template>
              </v-text-field>
            </template>
            <v-date-picker v-model="startDate" locale="es" color="primary"></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="12" md="6">
          <v-menu transition="scale-transition" offset-y :close-on-content-click="false">
            <template #activator="{ props }">
              <v-text-field
                v-model="formattedEndDate"
                label="Comandas hasta"
                readonly
                v-bind="props"
              >
                <template #prepend-inner>
                  <i-ph-calendar-duotone />
                </template>
              </v-text-field>
            </template>
            <v-date-picker v-model="endDate" locale="es" color="primary"></v-date-picker>
          </v-menu>
        </v-col>
      </v-row>

      <!-- ################### -->

      <!-- TABLE -->
      <v-data-table
        :headers="headers"
        :items="filteredProducts"
        item-key="id"
        :items-per-page="itemsPerPage"
        class="elevation-3"
      >
        <!-- TOP -->
        <template #top>
          <v-toolbar flat color="#00765126" class="rounded">
            <v-toolbar-title class="font-italic">Informe de Catalogo de Productos</v-toolbar-title>
          </v-toolbar>
        </template>

        <!-- HEADER -->
        <template #headers="{ columns, isSorted, toggleSort }">
          <tr>
            <template v-for="column in columns" :key="column.key">
              <td>
                <span
                  :class="[
                    column.sortable ? 'cursor-pointer' : 'cursor-not-allowed',
                    'text-blue-grey-darken-2',
                    'text-uppercase',
                    'font-weight-bold',
                  ]"
                  @click="column.sortable ? toggleSort(column) : null"
                >
                  {{ column.title }}
                </span>
                <!-- Icon sortable -->
                <template v-if="isSorted(column)">
                  <i-mdi-chevron-down
                    class="cursor-pointer ml-1 pt-1"
                    @click="column.sortable ? toggleSort(column) : null"
                  />
                </template>
                <!-- Delete Column -->
                <i-ph-x
                  v-if="column.removable"
                  class="cursor-pointer text-red-lighten-2 ml-6 pt-1"
                  @click="removeHeader(column.key)"
                />
              </td>
            </template>
          </tr>
        </template>

        <!-- BODY: Comandas -->
        <template #[`item.titulo`]="{ item }">
          <v-avatar class="mr-2" :image="item.images.url" />
          <span class="text-h6 text-blue-grey-darken-3 text-button font-italic">
            {{ item.titulo }}
          </span>
        </template>
        <template #[`item.totalUsado`]="{ item }">
          <v-chip color="blue-accent-1" class="ml-6">
            {{ item.totalUsado }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
