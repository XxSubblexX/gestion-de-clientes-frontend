<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

// =====================
// 🔥 DATOS USUARIO
// =====================
const id_usuario = ref(null)
const nombre = ref("")
const correo = ref("")
const password = ref("[]")

// =====================
// 🔥 UI STATES
// =====================
const mostrarDialogEliminar = ref(false)
const confirmText = ref("")
const loadingEliminar = ref(false)

// =====================
// 📥 CARGAR USUARIO
// =====================
onMounted(async () => {
  try {
    const info = JSON.parse(localStorage.getItem("info"))
    const token = localStorage.getItem("token")

    if (!info || !token) return

    id_usuario.value = info.id
    nombre.value = info.nombre

    const res = await axios.get(
      `http://localhost:3000/usuarios/${id_usuario.value}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    correo.value = res.data?.correo || ""
    password.value = ""

  } catch (error) {
    console.error(error)
  }
})

// =====================
// 💾 ACTUALIZAR USUARIO
// =====================
const actualizarDatos = async () => {
  try {
    const token = localStorage.getItem("token")

    const data = {
      nombre: nombre.value,
      correo: correo.value
    }

    if (password.value?.trim()) {
      data.password = password.value
    }

    await axios.put(
      `http://localhost:3000/usuarios/${id_usuario.value}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    password.value = ""

    alert("Datos actualizados correctamente")

  } catch (error) {
    console.error(error)
    alert("No se pudieron guardar los cambios")
  }
}

// =====================
// 🚪 CERRAR SESIÓN
// =====================
const cerrarSesion = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("info")

  router.push({ name: "inicioSesion" })
}

// =====================
// 🗑️ ELIMINAR USUARIO
// =====================
const eliminarUsuario = async () => {
  try {
    loadingEliminar.value = true

    const token = localStorage.getItem("token")

    await axios.delete(
      `http://localhost:3000/usuarios/${id_usuario.value}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    localStorage.removeItem("token")
    localStorage.removeItem("info")

    router.push({ name: "inicioSesion" })

  } catch (error) {
    console.error(error)
    alert("No se pudo eliminar la cuenta")
  } finally {
    loadingEliminar.value = false
  }
}
</script>

<template>

<v-container class="d-flex justify-center">

  <v-card width="600" class="pa-6" rounded="xl" elevation="10">

    <!-- HEADER -->
    <v-card-title class="text-h5 font-weight-bold">
      Modificar Cuenta
    </v-card-title>

    <v-divider class="my-4" />

    <!-- FORM -->
    <v-text-field
      v-model="nombre"
      label="Nombre"
      variant="outlined"
      class="mb-3"
      prepend-inner-icon="mdi-account"
    />

    <v-text-field
      v-model="correo"
      label="Correo"
      variant="outlined"
      class="mb-3"
      prepend-inner-icon="mdi-email"
    />

    <v-text-field
      v-model="password"
      label="Contraseña (Opcional)"
      type="password"
      variant="outlined"
      class="mb-4"
      prepend-inner-icon="mdi-lock"
    />

    <!-- BOTÓN GUARDAR -->
    <v-btn
      color="primary"
      block
      class="mb-3"
      prepend-icon="mdi-content-save"
      @click="actualizarDatos"
    >
      Guardar Cambios
    </v-btn>

    <!-- LOGOUT -->
    <v-btn
      color="grey-darken-1"
      variant="tonal"
      block
      class="mb-3"
      prepend-icon="mdi-logout"
      @click="cerrarSesion"
    >
      Cerrar sesión
    </v-btn>

    <!-- ELIMINAR -->
    <v-btn
      color="error"
      variant="tonal"
      block
      prepend-icon="mdi-delete"
      @click="mostrarDialogEliminar = true"
    >
      Eliminar cuenta
    </v-btn>

  </v-card>

</v-container>

<!-- DIALOG ELIMINAR -->
<v-dialog v-model="mostrarDialogEliminar" max-width="450">
  <v-card rounded="xl" class="pa-4">

    <v-card-title class="text-red font-weight-bold">
      Eliminar cuenta
    </v-card-title>

    <v-card-text>
      <p class="mb-3">
        Escribe <b>ELIMINAR</b> para confirmar
      </p>

      <v-text-field
        v-model="confirmText"
        label="ELIMINAR"
        variant="outlined"
      />
    </v-card-text>

    <v-card-actions>
      <v-spacer />

      <v-btn variant="text" @click="mostrarDialogEliminar = false">
        Cancelar
      </v-btn>

      <v-btn
        color="error"
        :loading="loadingEliminar"
        :disabled="confirmText !== 'ELIMINAR'"
        @click="eliminarUsuario"
      >
        Eliminar
      </v-btn>

    </v-card-actions>

  </v-card>
</v-dialog>

</template>

<style scoped>
/* Parche CSS definitivo para Vuetify 3 que limpia el fondo inyectado por navegadores */
:deep(.v-field input:-webkit-autofill),
:deep(.v-field input:-webkit-autofill:hover), 
:deep(.v-field input:-webkit-autofill:focus),
:deep(.v-field input:-webkit-autofill:active) {
  -webkit-box-shadow: 0 0 0px 1000px white inset !important;
  -webkit-text-fill-color: #000000 !important;
  transition: background-color 5000s ease-in-out 0s;
}
</style>