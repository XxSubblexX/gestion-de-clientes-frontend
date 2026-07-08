<template>
  <v-container class="py-6">

  <v-card
  class="mb-6 bg-gradient pa-4"
  rounded="xl"
  elevation="3"
>
  <v-row align="center">
    <!-- Información -->
    <v-col
      cols="12"
      sm="8"
      class="d-flex align-center"
    >
      <v-avatar
        color="primary-lighten-4"
        size="48"
        class="mr-4"
      >
        <v-icon
          color="primary"
          size="28"
        >
          mdi-cart
        </v-icon>
      </v-avatar>

      <div>
        <h2 class="text-h5 font-weight-bold text-grey-darken-3 mb-1">
          Compras
        </h2>

        <div class="d-flex align-center text-subtitle-2 text-medium-emphasis">
          <v-icon
            size="16"
            class="mr-1"
            color="grey"
          >
            mdi-account-circle-outline
          </v-icon>

          <span class="mr-1">Usuario:</span>

          <userSettings
            :nombre="nombre"
            @actualizarNombre="nombreActualizado"
            @cerrar="mostrarAjustesDeUsuario = false"
            @notificar="manejarNotificacion"
          />
        </div>
      </div>
    </v-col>

    <!-- Acciones -->
    <v-col
      cols="12"
      sm="4"
      class="d-flex justify-sm-end justify-start align-center ga-2"
    >
      <historialCompras />

      <confirmarCompra
        :disabled="!clienteSeleccionado || !productos.some(p => p.cantidad > 0)"
        :cliente="clienteSeleccionado"
        :productos="productos.filter(p => p.cantidad > 0)"
      />
    </v-col>
  </v-row>
</v-card>

    <v-card
      class="mb-6 pa-4"
      rounded="xl"
      elevation="2"
    >
      <v-row align="center">

        <v-col
          cols="12"
          md="3"
          class="d-flex align-center"
        >
          <v-avatar
            color="primary-lighten-4"
            size="46"
            class="mr-3"
          >
            <v-icon
              color="primary"
              size="24"
            >
              mdi-account
            </v-icon>
          </v-avatar>

          <div>
            <div class="text-subtitle-1 font-weight-bold">
              Cliente
            </div>

            <div class="text-caption text-medium-emphasis">
              Selecciona el cliente para esta compra
            </div>
          </div>
        </v-col>

        <v-col
          cols="12"
          md="9"
        >
          <v-autocomplete
            v-model="clienteSeleccionado"
            :items="clientes"
            item-title="nombreCompleto"
            item-value="id_cliente"
            label="Buscar cliente"
            prepend-inner-icon="mdi-account-search"
            variant="outlined"
            clearable
            hide-details
            return-object
          />
        </v-col>

      </v-row>
    </v-card>

    <v-row>
      <v-col
        v-for="producto in productos"
        :key="producto.id_producto"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card
          class="producto-card h-100 d-flex flex-column"
          rounded="xl"
          :elevation="producto.cantidad > 0 ? 10 : 4"
          :class="{
            'producto-seleccionado': producto.cantidad > 0
          }"
        >
          <v-img
            :src="producto.fotografia_principal_url"
            height="220"
            cover
            gradient="to bottom, rgba(0,0,0,.05), rgba(0,0,0,.35)"
          >
            <v-chip
              v-if="producto.cantidad > 0"
              class="ma-2"
              color="success"
              prepend-icon="mdi-check"
            >
              Seleccionado
            </v-chip>
          </v-img>

          <v-card-title class="pb-2">
            <div class="d-flex justify-space-between align-center w-100">
              <span class="text-subtitle-1 font-weight-bold text-truncate">
                {{ producto.nombre }}
              </span>

              <v-chip
                :color="producto.estado ? 'success' : 'error'"
                size="small"
                variant="flat"
              >
                {{ producto.estado ? "Disponible" : "Agotado" }}
              </v-chip>
            </div>
          </v-card-title>

          <v-card-text class="pt-0 flex-grow-1">
            <div class="text-body-2 mb-2">
              {{ producto.descripcion }}
            </div>

            <div
              v-if="producto.caracteristicas"
              class="text-caption text-medium-emphasis"
            >
              {{ producto.caracteristicas }}
            </div>
            <div>
              <div class="text-caption text-medium-emphasis">
                Precio
                <span class="text-h5 font-weight-black text-primary">
                $ {{ Number(producto.precio_venta).toLocaleString() }}
              </span>
              </div>
              
            </div>
          </v-card-text>

          <v-divider />

          <v-card-actions class="pa-4 justify-space-between">
             

            <div class="d-flex align-center ga-2">
              <v-btn
                icon="mdi-minus"
                size="small"
                color="error"
                variant="tonal"
                :disabled="producto.cantidad === 0"
                @click="disminuirCantidad(producto)"
              />

              <div class="contador">
                {{ producto.cantidad }}
              </div>

              <v-btn
                icon="mdi-plus"
                size="small"
                color="success"
                variant="tonal"
                @click="aumentarCantidad(producto)"
              />
            </div>
          </v-card-actions>

        </v-card>
      </v-col>
    </v-row>

    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
    >
      {{ snackbarTexto }}
    </v-snackbar>

  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue" // <-- Eliminado 'computed'
import axios from "axios"
import { useRouter } from "vue-router"

import confirmarCompra from "@/components/crearFacturaModal.vue"
import userSettings from "@/components/userSettings.vue"
import historialCompras from "../components/historialCompras.vue"

const router = useRouter()

// Usuario
const id_usuario = ref(null)
const nombre = ref("")
const mostrarAjustesDeUsuario = ref(false)

// Productos
const productos = ref([])

// Clientes
const clientes = ref([])
const clienteSeleccionado = ref(null)

// Snackbar
const snackbar = ref(false)
const snackbarTexto = ref("")
const snackbarColor = ref("success")

const manejarNotificacion = (alerta) => {
  snackbarTexto.value = alerta.texto
  snackbarColor.value = alerta.color
  snackbar.value = true
}

const nombreActualizado = (nuevoNombre) => {
  nombre.value = nuevoNombre
}

// ===========================
// CANTIDADES
// ===========================

const aumentarCantidad = (producto) => {
  if (producto.cantidad < 10) {
    producto.cantidad++
  }
}

const disminuirCantidad = (producto) => {
  if (producto.cantidad > 0) {
    producto.cantidad--
  }
}

// ===========================
// PRODUCTOS
// ===========================

const cargarProductos = async () => {
  try {
    const respuesta = await axios.get(
      "http://localhost:3000/productos"
    )

    productos.value = respuesta.data.map(producto => ({
      ...producto,
      cantidad: 0
    }))
  } catch (error) {
    console.error("Error al cargar productos:", error)

    if (error.response?.status === 401) {
      router.push({ name: "inicioSesion" })
    }
  }
}

// ===========================
// CLIENTES
// ===========================

const cargarClientes = async () => {
  try {
    const respuesta = await axios.get(
      `http://localhost:3000/clientes/${id_usuario.value}`,
      {
        headers: {
          token: `Bearer ${localStorage.getItem("token")}`
        }
      }
    )

    clientes.value = respuesta.data.map(cliente => ({
      ...cliente,
      nombreCompleto: `${cliente.razon_social} • NIT: ${cliente.nit}`
    }))

  } catch (error) {
    console.error("Error al cargar clientes:", error)

    if (error.response?.status === 401) {
      router.push({ name: "inicioSesion" })
    }
  }
}

// ===========================
// CARGA INICIAL
// ===========================

onMounted(async () => {
  try {
    const info = JSON.parse(localStorage.getItem("info"))

    if (info) {
      id_usuario.value = info.id
    }

    const respuesta = await axios.get(
      `http://localhost:3000/usuarios/${id_usuario.value}`,
      {
        headers: {
          token: `Bearer ${localStorage.getItem("token")}`
        }
      }
    )

    nombre.value = respuesta.data.nombre
  } catch (error) {
    console.error(error)

    if (error.response?.status === 401) {
      router.push({ name: "inicioSesion" })
    }
  }

  await cargarClientes()
  await cargarProductos()
})
</script>

<style scoped>
.producto-card{
  transition: .25s ease;
}

.producto-seleccionado{
  border: 2px solid rgb(var(--v-theme-primary));
  transform: translateY(-3px);
}
</style>