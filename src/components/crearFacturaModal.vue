<template>
  <v-dialog
    v-model="dialog"
    max-width="800"
  >
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        color="primary"
        prepend-icon="mdi-receipt-text-plus"
        :disabled="disabled"
      >
        Crear factura
      </v-btn>
    </template>

    <v-card rounded="xl">

      <!-- Encabezado -->
      <v-card
        flat
        color="primary"
        class="pa-5 text-white"
      >
        <div class="d-flex align-center">

          <v-avatar
            color="white"
            class="mr-4"
          >
            <v-icon color="primary">
              mdi-file-document-outline
            </v-icon>
          </v-avatar>

          <div>
            <div class="text-h5 font-weight-bold ">
              Confirmar factura
            </div>

            <div class="text-subtitle-2">
              Revisa la información antes de generar la compra.
            </div>
          </div>

        </div>
      </v-card>

      <v-card-text class="pa-6">

        <!-- Cliente -->
        <v-card
          variant="tonal"
          rounded="lg"
          class="mb-6 pa-4"
          v-if="cliente"
        >
          <div class="text-subtitle-1 font-weight-bold mb-3">
            Cliente
          </div>

          <v-row>

            <v-col cols="8">
              <div class="text-body-1">
                {{ cliente?.razon_social }}
              </div>

              <div class="text-caption text-medium-emphasis">
                {{ cliente?.correo }}
              </div>
            </v-col>

            <v-col
              cols="4"
              class="text-right"
            >
              <v-chip
                color="primary"
                variant="flat"
              >
                NIT {{ cliente?.nit }}
              </v-chip>
            </v-col>

          </v-row>
        </v-card>

        <!-- Productos -->
        <div class="text-subtitle-1 font-weight-bold mb-3">
          Productos seleccionados
        </div>

        <v-table density="comfortable">

          <thead>
            <tr>
              <th>Producto</th>
              <th class="text-center">Cant.</th>
              <th class="text-right">Precio</th>
              <th class="text-right">Subtotal</th>
            </tr>
          </thead>

          <tbody>

            <tr
              v-for="producto in productos"
              :key="producto.id_producto"
            >
              <td>{{ producto.nombre }}</td>

              <td class="text-center">
                <v-chip
                  size="small"
                  color="primary"
                  variant="tonal"
                >
                  {{ producto.cantidad }}
                </v-chip>
              </td>

              <td class="text-right">
                ${{ Number(producto.precio_venta).toLocaleString() }}
              </td>

              <td class="text-right font-weight-bold">
                ${{
                  (
                    producto.cantidad *
                    Number(producto.precio_venta)
                  ).toLocaleString()
                }}
              </td>

            </tr>

          </tbody>

        </v-table>

        <v-divider class="my-6" />

        <!-- Total -->
        <div class="d-flex justify-space-between align-center">

          <div>
            <div class="text-subtitle-2 text-medium-emphasis">
              Total de la compra
            </div>

            <div class="text-h4 font-weight-black text-primary">
              $ {{ total.toLocaleString() }}
            </div>
          </div>

          <v-icon
            color="success"
            size="56"
          >
            mdi-cash-check
          </v-icon>

        </div>

      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">

        <v-spacer />

        <v-btn
          variant="text"
          @click="dialog = false"
        >
          Cancelar
        </v-btn>

        <v-btn
  color="primary"
  prepend-icon="mdi-check-circle"
  @click="dialogConfirmacion = true"
>
  Confirmar factura
</v-btn>

      </v-card-actions>

    </v-card>
  </v-dialog>
  <v-dialog
  v-model="dialogConfirmacion"
  max-width="450"
>
  <v-card rounded="xl">

    <v-card-title class="text-h6">
      Confirmar creación
    </v-card-title>

    <v-card-text>
      ¿Deseas crear esta factura?

      <div class="mt-4 text-h6 font-weight-bold text-primary">
        Total: $ {{ total.toLocaleString() }}
      </div>
    </v-card-text>

    <v-card-actions>

      <v-spacer />

      <v-btn
        variant="text"
        @click="dialogConfirmacion = false"
      >
        Cancelar
      </v-btn>

      <v-btn
        color="primary"
        prepend-icon="mdi-check"
        @click="confirmarFactura"
      >
        Sí, crear factura
      </v-btn>

    </v-card-actions>

  </v-card>
</v-dialog>
</template>

<script setup>
import { ref, computed } from "vue"
import axios from "axios"

const dialog = ref(false)
const dialogConfirmacion = ref(false)

const { cliente, productos, disabled } = defineProps([
  "cliente",
  "productos",
  "disabled"
])

const total = computed(() =>
  productos ? productos.reduce(
    (suma, producto) =>
      suma + producto.cantidad * Number(producto.precio_venta),
    0
  ) : 0
)

const confirmarFactura = async () => {
  dialogConfirmacion.value = false
  await crearFactura()
}

const crearFactura = async () => {
  try {
    const info = JSON.parse(localStorage.getItem("info"))

    // Estructuramos el objeto tal como lo espera tu backend
    const factura = {
        id_cliente: cliente.id_cliente,
        id_usuario: info.id,
        productos: productos.map(producto => ({
            id_producto: producto.id_producto,
            cantidad: Number(producto.cantidad),
            precio_venta: Math.round(Number(producto.precio_venta))
        }))
    }

    // Petición Axios configurada correctamente para recibir archivos binarios
    const respuesta = await axios.post(
      "http://localhost:3000/facturas",
      factura,
      {
        responseType: "blob", // CRÍTICO para que interprete el PDF binario
        headers: {
          token: `Bearer ${localStorage.getItem("token")}`
        }
      }
    )

    // Convertimos la respuesta binaria a un archivo PDF descargable
    const blob = new Blob([respuesta.data], { type: "application/pdf" })
    const url = window.URL.createObjectURL(blob)
    
    const enlace = document.createElement("a")
    enlace.href = url
    enlace.download = `Factura_${new Date().getTime()}.pdf` 
    
    document.body.appendChild(enlace)
    enlace.click() 
    
    // Limpieza preventiva de recursos de memoria
    document.body.removeChild(enlace)
    window.URL.revokeObjectURL(url)

    dialog.value = false

  } catch (error) {
    console.error("Error al crear y descargar la factura:", error)
  }
}
</script>
