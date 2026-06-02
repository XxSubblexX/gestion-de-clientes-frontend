<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

// =====================
// 🔥 DATOS USUARIO (estado del formulario)
// =====================
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
const confirmText = ref("") // texto de confirmación "ELIMINAR"
const loadingEliminar = ref(false) // loading botón eliminar

const props = defineProps(['nombre'])
const emit = defineEmits(['actualizarNombre'])
// =====================
// ⚙️ ABRIR SETTINGS + CARGAR INFO USUARIO
// =====================
const activarSettings = async () => {
  try {
    // obtener datos guardados en localStorage
    const info = JSON.parse(localStorage.getItem("info"))
    const token = localStorage.getItem("token")

    // si no hay datos, salir
    if (!info || !token) return

    // guardar id del usuario
    id_usuario.value = info.id
    nombre_edit.value = info.nombre

    // petición al backend para traer datos reales del usuario
    const res = await axios.get(
      `http://localhost:3000/usuarios/${id_usuario.value}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    // asignar datos al formulario
    nombre_edit.value = res.data.nombre
    correo.value = res.data.correo || ""
    password.value = "" // nunca precargar password

    // abrir modal
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

    // objeto base que siempre se envía
    const data = {
      nombre: nombre_edit.value,
      correo: correo.value
    }

    // solo enviar password si el usuario escribió algo
    if (password.value?.trim()) {
      data.password = password.value
    }

    // petición PUT para actualizar usuario
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
  // borrar sesión
  localStorage.removeItem("token")
  localStorage.removeItem("info")

  // redirigir a login
  router.push({ name: "inicioSesion" })
}

// =====================
// 🗑️ ELIMINAR USUARIO
// =====================
const eliminarUsuario = async () => {
  try {
    loadingEliminar.value = true

    const token = localStorage.getItem("token")

    // petición DELETE usuario
    await axios.delete(
      `http://localhost:3000/usuarios/${id_usuario.value}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    // limpiar sesión después de eliminar cuenta
    localStorage.removeItem("token")
    localStorage.removeItem("info")

    // ir a login
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
            {{ modelValue }} <!-- debug: muestra estado del modal -->
          </v-card-title>

          <!-- botón cerrar modal -->
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
    <v-dialog v-model="mostrarDialogEliminar" max-width="450">

      <v-card rounded="xl" class="pa-4">

        <v-card-title class="text-red font-weight-bold">
          Eliminar cuenta
        </v-card-title>

        <v-card-text>
          <p class="mb-3">
            Escribe <b>ELIMINAR</b> para confirmar
          </p>

          <!-- input confirmación -->
          <v-text-field
            v-model="confirmText"
            label="ELIMINAR"
            variant="outlined"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <!-- cancelar -->
          <v-btn variant="text" @click="mostrarDialogEliminar = false">
            Cancelar
          </v-btn>

          <!-- confirmar eliminar -->
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

  </div>
</template>

<style scoped>
/* fix visual de autofill en inputs */
:deep(.v-field input:-webkit-autofill),
:deep(.v-field input:-webkit-autofill:hover), 
:deep(.v-field input:-webkit-autofill:focus),
:deep(.v-field input:-webkit-autofill:active) {
  -webkit-box-shadow: 0 0 0px 1000px white inset !important;
  -webkit-text-fill-color: #000000 !important;
  transition: background-color 5000s ease-in-out 0s;
}
</style>