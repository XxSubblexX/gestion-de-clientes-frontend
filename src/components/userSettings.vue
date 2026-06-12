<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const show1 = ref(false) // mostrar/ocultar contraseña
const modelValue = ref(false) // controla apertura del dialog
const id_usuario = ref(null) // id del usuario logueado
const nombre_edit = ref("") // nombre editable
const correo = ref("") // correo editable
const password = ref("") // nueva contraseña (opcional)
const estado = ref("")
const cargando = ref(false) // estado de carga para el botón guardar
const formRef = ref(null) // referencia del formulario

// =====================
// 🔥 UI STATES (estado UI extra)
// =====================
const mostrarDialogEliminar = ref(false) // dialog de confirmación eliminar
const loadingEliminar = ref(false) // loading botón eliminar

const props = defineProps(['nombre'])
const emit = defineEmits(['actualizarNombre', 'notificar', 'cerrar'])

// Reglas de validación y seguridad
const reglas = {
  nombre: [
    v => !!v || 'El nombre es obligatorio',
    v => (v && v.trim().length >= 3) || 'Debe tener al menos 3 caracteres',
    v => !/[<>;"'=$%]/.test(v) || 'No se permiten caracteres especiales peligrosos'
  ],
  correo: [
    v => !!v || 'El correo electrónico es obligatorio',
    v => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) || 'El formato de correo no es válido'
  ],
  password: [
    v => !v || v.length >= 6 || 'La nueva contraseña debe tener al menos 6 caracteres',
    v => !v || !/[<>;"]/.test(v) || 'No se permiten caracteres especiales peligrosos'
  ]
}

// =====================
// ⚙️ ABRIR SETTINGS + CARGAR INFO USUARIO
// =====================
const activarSettings = async () => {
  if (formRef.value) {
    formRef.value.resetValidation() // Limpia alertas rojas anteriores
  }

  try {
    const info = JSON.parse(localStorage.getItem("info"))
    const token = localStorage.getItem("token")

    if (!info || !token) {
      emit('notificar', { texto: 'Sesión no válida', color: 'error' })
      return
    }

    id_usuario.value = info.id
    nombre_edit.value = info.nombre
    estado.value = info.estado

    // Corregido: Cabecera unificada a 'token' para mantener consistencia con tu backend
    const res = await axios.get(
      `http://localhost:3000/usuarios/${id_usuario.value}`,
      {
        headers: {
          token: `Bearer ${token}`
        }
      }
    )

    nombre_edit.value = res.data.nombre || ""
    correo.value = res.data.correo || ""
    password.value = "" 

    modelValue.value = true

  } catch (error) {
    console.error(error)
    emit('notificar', { texto: 'Error al obtener datos de la cuenta', color: 'error' })
  }
}

// =====================
// 💾 ACTUALIZAR USUARIO
// =====================
const actualizarDatos = async () => {
  if (!formRef.value) return

  // Validar visualmente el formulario antes de la petición HTTP
  const { valid } = await formRef.value.validate()
  if (!valid) return

  cargando.value = true
  try {
    const token = localStorage.getItem("token")

    const data = {
      nombre: nombre_edit.value.trim(),
      correo: correo.value.trim().toLowerCase(),
      estado: estado.value 
    }

    if (password.value?.trim()) {
      data.password = password.value
    }

    // Corregido: Cabecera cambiada a 'token' para que coincida con tus otras rutas
    await axios.put(
      `http://localhost:3000/usuarios/${id_usuario.value}`,
      data,
      {
        headers: {
          token: `Bearer ${token}`
        }
      }
    )

    // Actualizar datos locales en el localStorage para evitar desincronización
    const info = JSON.parse(localStorage.getItem("info")) || {}
    info.nombre = nombre_edit.value.trim()
    localStorage.setItem("info", JSON.stringify(info))

    password.value = ""
    emit('actualizarNombre', nombre_edit.value.trim())
    modelValue.value = false
    emit('notificar', { texto: 'Tus datos se actualizaron correctamente', color: 'success' })
  } catch (error) {
    console.error(error)
    emit('notificar', { texto: 'No se pudieron guardar los cambios', color: 'error' })
  } finally {
    cargando.value = false
  }
}

// =====================
// 🚪 CERRAR SESIÓN
// =====================
const cerrarSesion = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("info")
  emit('cerrar')
  router.push({ name: "inicioSesion" })
}

// =====================
// 🗑️ ELIMINAR USUARIO
// =====================
const eliminarUsuario = async () => {
  try {
    loadingEliminar.value = true
    const token = localStorage.getItem("token")

    // Corregido: Cabecera cambiada a 'token'
    await axios.delete(
      `http://localhost:3000/usuarios/${id_usuario.value}`,
      {
        headers: {
          token: `Bearer ${token}`
        }
      }
    )

    localStorage.removeItem("token")
    localStorage.removeItem("info")
    mostrarDialogEliminar.value = false
    modelValue.value = false
    router.push({ name: "inicioSesion" })

  } catch (error) {
    console.error(error)
    emit('notificar', { texto: 'No se pudo eliminar la cuenta', color: 'error' })
  } finally {
    loadingEliminar.value = false
  }
}
</script>

<template>
  <div>
    <!-- nombre clickeable para abrir settings -->
    <span @click="activarSettings()" class="text-primary font-weight-bold transition-link" style="cursor: pointer;">
      {{ nombre }}
    </span>

    <!-- MODAL DE EDICIÓN DE USUARIO -->
    <v-dialog v-model="modelValue" max-width="600" persistent>
      <v-card width="600" class="pa-6" rounded="xl" elevation="10">

        <!-- HEADER DEL MODAL -->
        <div class="d-flex justify-space-between align-center">
          <v-card-title class="text-h5 font-weight-bold px-0 text-grey-darken-4">
            Modificar Cuenta
          </v-card-title>

          <v-btn 
            icon="mdi-close" 
            variant="text" 
            size="small"
            :disabled="cargando"
            @click="modelValue = false" 
          />
        </div>

        <v-divider class="my-4" />

        <!-- FORM: Se añade la referencia 'formRef' -->
        <v-form ref="formRef" @submit.prevent="actualizarDatos">

          <!-- INPUT NOMBRE -->
          <v-text-field
            v-model="nombre_edit"
            label="Nombre Completo"
            variant="outlined"
            class="mb-3"
            prepend-inner-icon="mdi-account"
            :rules="reglas.nombre"
            hide-details="auto"
            maxlength="100"
          />

          <!-- INPUT CORREO -->
          <v-text-field
            v-model="correo"
            label="Correo Electrónico"
            variant="outlined"
            class="mb-3"
            prepend-inner-icon="mdi-email"
            :rules="reglas.correo"
            hide-details="auto"
            maxlength="100"
          />

          <!-- INPUT PASSWORD (opcional) -->
          <v-text-field
            v-model="password"
            label="Contraseña (Dejar vacío si no deseas cambiarla)"
            :type="show1 ? 'text' : 'password'"
            variant="outlined"
            class="mb-5"
            prepend-inner-icon="mdi-lock"
            @click:append="show1 = !show1"
            :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="reglas.password"
            hide-details="auto"
            maxlength="50"
          />

          <!-- BOTÓN GUARDAR -->
          <v-btn
            color="primary"
            block
            size="large"
            rounded="lg"
            class="mb-3 text-capitalize font-weight-bold"
            prepend-icon="mdi-content-save"
            type="submit"
            :loading="cargando"
          >
            Guardar Cambios
          </v-btn>

        </v-form>

        <!-- BOTÓN LOGOUT -->
        <v-btn
          color="grey-darken-2"
          variant="tonal"
          block
          size="large"
          rounded="lg"
          class="mb-3 text-capitalize font-weight-bold"
          prepend-icon="mdi-logout"
          :disabled="cargando"
          @click="cerrarSesion"
        >
          Cerrar sesión
        </v-btn>

        <!-- BOTÓN ELIMINAR -->
        <v-btn
          color="error"
          variant="tonal"
          block
          size="large"
          rounded="lg"
          class="text-capitalize font-weight-bold"
          prepend-icon="mdi-delete"
          :disabled="cargando"
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
            class="px-6 text-capitalize"
            :disabled="loadingEliminar"
            @click="mostrarDialogEliminar = false"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="error"
            variant="flat"
            class="px-6 text-capitalize font-weight-bold"
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