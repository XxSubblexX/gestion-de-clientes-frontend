<template>
  <v-container class="py-6">
          <v-btn
        v-bind="props"
        @click="activarDialog"
        prepend-icon="mdi-history"
      >
        Historial
      </v-btn>

  <v-dialog v-model="dialog">
    <v-card
      rounded="xl"
      elevation="3"
    >

      <v-card
        flat
        color="primary"
        class="pa-5 text-white"
      >
        <div class="text-h5 font-weight-bold">
          Historial de compras
        </div>

        <div class="text-subtitle-2">
          Consulta todas las facturas realizadas.
        </div>
        
      </v-card>
        <v-btn 
            icon="mdi-close" 
            variant="text" 
            size="small"
            :disabled="cargando"
            @click="dialog = false" 
          />
      <v-card-text>

        <v-data-table
          :headers="headers"
          :items="facturas"
          item-value="id_factura"
          show-expand
          hover
        >

          <template #item.num_factura="{ item }">
            <v-chip
              color="primary"
              variant="tonal"
            >
              {{ item.num_factura }}
            </v-chip>
          </template>

          <template #item.materiales="{ item }">
            {{ item.materiales.length }}
          </template>

          <template #expanded-row="{ columns, item }">

            <tr>

              <td :colspan="columns.length">

                <v-card
                  flat
                  variant="tonal"
                  class="ma-4 pa-4"
                >

                  <div class="text-subtitle-1 font-weight-bold mb-4">
                    Productos
                  </div>

                  <v-table density="compact">

                    <thead>

                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Subtotal</th>
                      </tr>

                    </thead>

                    <tbody>

                      <tr
                        v-for="producto in item.materiales"
                        :key="producto.producto"
                      >
                        <td>{{ producto.producto }}</td>

                        <td>{{ producto.cantidad }}</td>

                        <td>
                          $
                          {{ Number(producto.precio_venta).toLocaleString() }}
                        </td>

                        <td class="font-weight-bold">
                          $
                          {{
                            (
                              producto.cantidad *
                              Number(producto.precio_venta)
                            ).toLocaleString()
                          }}
                        </td>

                      </tr>
                      
                    </tbody>

                  </v-table>

                </v-card>

              </td>

            </tr>

          </template>

        </v-data-table>

      </v-card-text>

      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"

const facturas = ref([])
const dialog = ref(false)

const activarDialog = () => {
  dialog.value = true
}
const headers = [
  {
    title: "Factura",
    key: "num_factura"
  },
  {
    title: "Cliente",
    key: "cliente"
  },
  {
    title: "Comerciante",
    key: "comerciante"
  },
  {
    title: "Total",
    key: "total"
  },
  
  {
    title: "Productos",
    key: "materiales"
  }
]

const obtenerFacturas = async () => {

  try {

    const { data } = await axios.get(
      "http://localhost:3000/facturas",
      {
        headers: {
          token: `Bearer ${localStorage.getItem("token")}`
        }
      }
    )

    facturas.value = data.facturas

  } catch (error) {
    console.error(error)
  }

}

onMounted(obtenerFacturas)
</script>