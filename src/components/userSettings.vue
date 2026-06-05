<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const show1 = ref(false) // mostrar/ocultar contraseña
const modelValue = ref(false) // controla apertura del dialog
const id_usuario = ref(null) // id del usuario logueado
const nombre_edit = ref("") // nombre editable
const correo = ref("") // correo editable
const password = ref("") // nueva contraseña (opcional)

// =====================
// 🔥 UI STATES (estado UI extra)
// =====================
const mostrarDialogEliminar = ref(false) // dialog de confirmación eliminar
const loadingEliminar = ref(false) // loading botón eliminar

const props = defineProps(['nombre'])
const emit = defineEmits(['actualizarNombre'])

// =====================
// ⚙️ ABRIR SETTINGS + CARGAR INFO USUARIO
// =====================
const activarSettings = async () => {
  try {
    const info = JSON.parse(localStorage.getItem("info"))
    const token = localStorage.getItem("token")

    if (!info || !token) return

    id_usuario.value = info.id
    nombre_edit.value = info.nombre

    const res = await axios.get(
      `http://localhost:3000/usuarios/${id_usuario.value}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    nombre_edit.value = res.data.nombre
    correo.value = res.data.correo || ""
    password.value = "" 

    modelValue.value = true

  } catch (error) {
    console.error(error)
  }
}

// =====================
// 💾 ACTUALIZAR USUARIO
// =====================
const actualizarDatos = async () => {
  try {
    const token = localStorage.getItem("token")

    const data = {
      nombre: nombre_edit.value,
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
    emit('actualizarNombre', nombre_edit.value)
    modelValue.value = false
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
  <div>
    <!-- nombre clickeable para abrir settings -->
    <span @click="activarSettings()" class="text-primary" style="cursor: pointer;">
      {{ nombre }}
    </span>

    <!-- MODAL DE EDICIÓN DE USUARIO -->
    <v-dialog :model-value="modelValue" max-width="600" persistent>
      <v-card width="600" class="pa-6" rounded="xl" elevation="10">

        <!-- HEADER DEL MODAL -->
        <div class="d-flex justify-space-between">
          <v-card-title class="text-h5 font-weight-bold">
            Modificar Cuenta
          </v-card-title>

          <v-btn 
            icon="mdi-close" 
            variant="text" 
            size="small"
            @click="modelValue = false" 
          />
        </div>

        <v-divider class="my-4" />

        <!-- INPUT NOMBRE -->
        <v-text-field
          v-model="nombre_edit"
          label="Nombre"
          variant="outlined"
          class="mb-3"
          prepend-inner-icon="mdi-account"
        />

        <!-- INPUT CORREO -->
        <v-text-field
          v-model="correo"
          label="Correo"
          variant="outlined"
          class="mb-3"
          prepend-inner-icon="mdi-email"
        />

        <!-- INPUT PASSWORD (opcional) -->
        <v-text-field
          v-model="password"
          label="Contraseña (Opcional)"
          :type="show1 ? 'text' : 'password'"
          variant="outlined"
          class="mb-4"
          prepend-inner-icon="mdi-lock"
          @click:append="show1 = !show1"
          :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
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

        <!-- BOTÓN LOGOUT -->
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

        <!-- BOTÓN ELIMINAR -->
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
    </v-dialog>

    <!-- MODAL CONFIRMAR ELIMINAR -->
    <v-dialog v-model="mostrarDialogEliminar" max-width="450" persistent>
      <v-card rounded="xl" class="pa-6 text-center">
        
        <v-icon color="error" size="64" class="mb-4">mdi-alert-octagon</v-icon>

        <v-card-title class="text-h5 text-red font-weight-bold justify-center pt-0">
          ¿Está seguro?
        </v-card-title>

        <v-card-text class="text-body-1 text-grey-darken-2 pt-2">
          Esta acción es <strong>permanente</strong>. Perderá el acceso a su cuenta y todos sus datos quedarán inaccesibles.
        </v-card-text>

        <v-card-actions class="justify-center gap-2 mt-4">
          <v-btn 
            variant="outlined" 
            color="grey-darken-1"
            class="px-6"
            :disabled="loadingEliminar"
            @click="mostrarDialogEliminar = false"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="error"
            variant="flat"
            class="px-6"
            :loading="loadingEliminar"
            @click="eliminarUsuario"
          >
            Sí, eliminar cuenta
          </v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>

  </div>
</template>

<style scoped>
:deep(.v-field input:-webkit-autofill),
:deep(.v-field input:-webkit-autofill:hover), 
:deep(.v-field input:-webkit-autofill:focus),
:deep(.v-field input:-webkit-autofill:active) {
  -webkit-box-shadow: 0 0 0px 1000px white inset !important;
  -webkit-text-fill-color: #000000 !important;
  transition: background-color 5000s ease-in-out 0s;
}
</style>
