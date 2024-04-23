<script setup>
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { useDisplay } from 'vuetify'
import { onMounted, computed, toRef, ref } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { useComandaStore } from '@/store/comandaStore'
import { supabase } from '@/services/supabase'
import { format } from 'date-fns'

const { smAndDown } = useDisplay()
const authStore = useAuthStore()
const comandaStore = useComandaStore()
const userMasterData = toRef(authStore, 'userMasterData')
const comandas = toRef(comandaStore, 'comandas')
const search = ref('')
const itemsPerPage = 12
// date pickers
const startDate = ref(null)
const endDate = ref(null)

// Report HEADERS
const headers = ref([
  { title: 'Cliente', align: 'start', sortable: false, key: 'clientes.nombre' },
  { title: 'Fecha creación', sortable: true, key: 'created_at' },
  { title: 'Cerrada en', sortable: true, removable: true, key: 'closed_at' },
  //   { title: 'Estado', key: 'status' },
  { title: 'Creado por', removable: true, key: 'created_by' },
  { title: 'Total (€)', removable: true, key: 'total' },
])

// Get all Comandas (without status)
onMounted(async () => {
  await comandaStore.fetchComandas(userMasterData.value.id_master)
  // console.info('[COMANDAS] ', comandas)
})

const formatDate = (dateString, hours) => {
  if (dateString) {
    const date = new Date(dateString)
    return hours ? format(date, 'dd/MM/yyyy HH:mm:ss') : format(date, 'dd/MM/yyyy')
  }
  return ''
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
  startDate.value = null
  endDate.value = null
}

const totalSum = computed(() =>
  filteredComandas.value.reduce((sum, comanda) => sum + comanda.total, 0)
)
const formatCurrency = value =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)

// DMO: BORRAR
// const totalSum = computed(() => {
//   const sum = filteredComandas.value.reduce((sum, comanda) => {
//     return sum + (comanda.total || 0)
//   }, 0)
//   // console.info(sum)
//   return sum
// })

// // Currency format (€)
// const formatCurrency = value => {
//   if (value) {
//     return new Intl.NumberFormat('es-ES', {
//       style: 'currency',
//       currency: 'EUR',
//     }).format(value)
//   }
//   return ''
// }
//
// Filter by 'Search' and Date Range
const filteredComandas = computed(() => {
  if (!comandas.value || !Array.isArray(comandas.value)) {
    return []
  }

  // 1 - Filter by Search
  const filteredBySearch = comandas.value.filter(comanda => {
    const searchTerm = search.value.toLowerCase()
    return (
      comanda.clientes.nombre.toLowerCase().includes(searchTerm) ||
      comanda.status.toLowerCase().includes(searchTerm) ||
      comanda.created_by.toLowerCase().includes(searchTerm) ||
      comanda.total.toString().toLowerCase().includes(searchTerm)
      // ... more search fields ...
    )
  })

  // 2 - Filter by created_at Range
  return filterByDate(filteredBySearch, startDate.value, endDate.value)
})

// Filter by Date: created_at
const filterByDate = (comandas, start, end) => {
  return comandas.filter(comanda => {
    const createdAt = new Date(comanda.created_at).getTime()
    const afterStart = start ? createdAt >= new Date(start).getTime() : true
    const beforeEnd = end ? createdAt <= new Date(end).getTime() : true
    return afterStart && beforeEnd
  })
}

// ##### PDF & Export Tools #####
const exportToPDF = save => {
  // eslint-disable-next-line new-cap
  const doc = new jsPDF()

  doc.autoTable({
    head: [headers.value.map(header => header.title)],
    body: filteredComandas.value.map(comanda => [
      comanda.clientes.nombre,
      formatDate(comanda.created_at, false),
      comanda.closed_at ? formatDate(comanda.closed_at, false) : '-',
      comanda.created_by,
      `${comanda.total.toFixed(2)} €`,
    ]),
    theme: 'striped',
    startY: 20,
    styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak' },
    columnStyles: { text: { cellWidth: 'auto' } },
    didDrawPage: data => {
      doc.text('[El Torres] Reporte Económico', 14, 15)
    },
  })
  if (save) doc.save(getPDFFileName())
  return doc
}

const getPDFFileName = () => {
  const fileExt = 'pdf'
  let fileName = ''

  // Check dates
  if (startDate.value) {
    const formattedStartDate = format(startDate.value, 'ddMMyyyy')
    const formattedEndDate = endDate.value ? format(endDate.value, 'ddMMyyyy') : '01019999'
    fileName = `reporte_economico-${formattedStartDate}-a-${formattedEndDate}.${fileExt}`
  } else {
    // Usar el año actual y la palabra 'total' si no hay fechas especificadas
    const year = new Date().getFullYear()
    fileName = `reporte_economico-total-${year}.${fileExt}`
  }

  return fileName
}

const generateAndUploadPDF = async () => {
  const doc = exportToPDF(false)
  const pdfOutput = doc.output('blob')

  // UPLOAD PDF
  // eslint-disable-next-line no-unused-vars
  const { data, error } = await supabase.storage
    .from('InvToPDF')
    .upload(getPDFFileName(), pdfOutput, { upsert: true })

  if (error) {
    console.error('Error uploading PDF:', error.message)
    return
  }
  console.info('PDF successfully uploaded to bucket')

  // Get PUBLIC URL
  const datapublicURL = await supabase.storage.from('InvToPDF').getPublicUrl(getPDFFileName())

  if (datapublicURL) {
    // console.info('Public URL:', datapublicURL)
    return datapublicURL.data.publicUrl
  } else {
    console.error('Error getting public URL: URL is null')
  }
}

const sendEmailWithPDF = async () => {
  // Upload & get URL from PDF
  const pdfUrl = await generateAndUploadPDF()
  let datesRange = ''

  // Check dates
  if (startDate.value) {
    const formattedStartDate = format(startDate.value, 'ddMMyyyy')
    const formattedEndDate = endDate.value ? format(endDate.value, 'ddMMyyyy') : '01019999'
    datesRange = `entre las fechas ${formattedStartDate} y ${formattedEndDate}`
  } else {
    // Usar el año actual y la palabra 'total' si no hay fechas especificadas
    const year = new Date().getFullYear()
    datesRange = `total para ${year}`
  }

  if (pdfUrl) {
    const subject = encodeURIComponent('[El Torres] Reporte Economico PDF')
    const body = encodeURIComponent(
      `Hola,\n\nEn el siguient enlace se podrá descargar el reporte economico ${datesRange} en PDF:\n\n ${pdfUrl}\n\nSaludos.`
    )

    const mailtoLink = `mailto:?subject=${subject}&body=${body}`

    // Abrir la URL en una nueva ventana emergente
    window.open(mailtoLink, '_blank')
  } else {
    alert('No se pudo generar el enlace PDF.')
  }
}

// ##### PDF & Export Tools #####
</script>

<template>
  <v-container>
    <v-card class="pa-4 mb-4 rounded-lg">
      <!-- Header -->
      <v-card-title class="d-flex align-center justify-space-between mb-5">
        <!-- <div class="d-flex align-center"> -->
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
          Reporte Económico
        </span>
        <!-- </div> -->
        <!-- <v-btn icon class="cursor-pointer text-red-lighten-2 ml-10" @click="resetFilters">
          <i-ph-pencil-simple-slash-duotone />
        </v-btn> -->
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
        :items="filteredComandas"
        item-key="id"
        :items-per-page="itemsPerPage"
        class="elevation-3"
        expand-on-click
        show-expand
      >
        <!-- TOP -->
        <template #top>
          <v-toolbar flat color="#00765126" class="rounded">
            <v-toolbar-title class="font-italic">Informe de Ingresos y Clientes</v-toolbar-title>
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
        <template #[`item.clientes.nombre`]="{ item }">
          <span class="text-h6 text-blue-grey-darken-3 text-button font-italic">
            {{ item.clientes.nombre }}
          </span>
        </template>
        <template #[`item.created_at`]="{ item }">
          <span class="text-subtitle-2 text-blue-grey-lighten-1">
            {{ formatDate(item.created_at, true) }}
          </span>
        </template>
        <template #[`item.closed_at`]="{ item }">
          <span v-if="item.closed_at" class="text-subtitle-2 text-red-accent-4">
            {{ formatDate(item.closed_at, true) }}
          </span>
          <span v-else class="text-subtitle-2 text-primary font-italic">- activa -</span>
        </template>
        <template #[`item.total`]="{ item }">
          <v-chip color="secondary">
            {{ formatCurrency(item.total) }}
          </v-chip>
        </template>

        <!-- EXPANDED: Products info-->
        <template #expanded-row="{ item }">
          <tr v-for="prod in item.comandas_productos" :key="prod.id">
            <v-avatar class="ml-4" :image="prod.producto.images.url" />
            <span class="text-overline ml-4">
              {{ prod.producto.titulo }}
            </span>
            <span class="ml-1">(x{{ prod.cantidad }})</span>
          </tr>
        </template>
        <!-- [EXPANDEN ICON] Only Custom-->
        <!-- <template #[`item.data-table-expand`]="{ isExpanded, toggleExpand }">
          <i-mdi-chevron-down v-if="isExpanded" class="cursor-pointer" @click="toggleExpand" />
          <i-mdi-chevron-up v-else class="cursor-pointer" @click="toggleExpand" />
        </template> -->

        <!-- FOOTER slot -->
        <!-- <template #bottom>
          <v-divider></v-divider>
          <v-row justify="end" class="ma-4">
            <span class="subtitle-1">Gasto total: {{ formatCurrency(totalSum.value) }}</span>
          </v-row>
          <v-pagination
            v-model="page"
            :length="Math.ceil(filteredComandas.length / itemsPerPage)"
            @click="paginatedItems"
          ></v-pagination>
        </template> -->
      </v-data-table>

      <v-row class="py-2 align-center">
        <!-- Resumen de gasto -->
        <v-col cols="12" md="6" class="d-flex justify-start align-center">
          <span class="text-h6 mr-4">Resumen de gasto:</span>
          <v-chip color="secondary" class="text-h5">
            {{ formatCurrency(totalSum) }}
          </v-chip>
        </v-col>

        <!-- Export burrons -->
        <v-col cols="12" md="6" class="d-flex justify-end align-center">
          <span class="text-h6 mr-1">Exportar</span>
          <i-ph-file-pdf-fill class="text-h5 text-red-accent-1" />
          <span class="text-h6 mr-4">:</span>
          <v-btn color="#00765126" @click="exportToPDF(true)">
            <i-ph-download-bold class="text-h5 text-blue-grey-darken-4" />
          </v-btn>
          <v-btn color="#00765126" @click="sendEmailWithPDF">
            <i-ph-envelope-bold class="text-h5 text-indigo-darken-1" />
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>
