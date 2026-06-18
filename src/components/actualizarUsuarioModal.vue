<template>
  <!-- BOTÓN QUE ABRE EL MODAL -->
  <v-btn
    icon="mdi-pencil"
    variant="text"
    color="primary"
    class="btn-animado mr-1"
    @click="cargarDialog()"
  />  
  
  <!-- Se añade 'persistent' para evitar cierres accidentales al editar -->
  <v-dialog v-model="modelValue" max-width="600" persistent>
    <v-card class="pa-5" rounded="xl" elevation="10">

      <!-- HEADER -->
      <v-card-title class="text-h5 font-weight-bold d-flex align-center text-grey-darken-4">
        <v-icon class="mr-2" color="primary" size="30">
          mdi-account-edit
        </v-icon>
        Actualizar Usuario
      </v-card-title>

      <v-divider class="my-3" />

      <!-- FORM: Se añade la referencia 'formRef' -->
      <v-form ref="formRef" @submit.prevent="actualizarUsuario">

        <v-text-field
          v-model="nombre"
          label="Nombre Completo"
          type="text"
          variant="outlined"
          prepend-inner-icon="mdi-account-outline"
          class="mb-3"
          :rules="reglas.nombre"
          hide-details="auto"
          maxlength="100"
        />

        <!-- Campo Correo -->
        <v-text-field
          v-model="correo"
          label="Correo Electrónico"
          type="email"
          variant="outlined"
          prepend-inner-icon="mdi-email-outline"
          class="mb-3"
          :rules="reglas.correo"
          hide-details="auto"
          maxlength="100"
        />

        <!-- Campo Rol -->
        <v-select
          :items="roles"
          item-title="id_nombre"
          item-value="id_rol"
          v-model="id_rol"
          label="Rol"
          variant="outlined"
          prepend-inner-icon="mdi-account"
          class="mb-4"
          :rules="reglas.rol"
          hide-details="auto"
        />

        <!-- Switch de Estado -->
        <div class="d-flex align-center pl-1 mb-4">
          <v-switch 
            v-model="estado" 
            :label="estado ? 'Usuario Activo' : 'Usuario Inactivo'"
            color="success"
            base-color="error"
            inset
            hide-details
            class="font-weight-bold mb-4"
            prepend-inner-icon="mdi-toggle-switch-outline"
          ></v-switch>
        </div>

        <!-- BOTONES -->
        <v-card-actions class="px-0 pt-2">
          <v-spacer />

          <v-btn 
            variant="text" 
            color="grey-darken-1" 
            @click="cerrar()"
            class="text-capitalize"
            :disabled="cargando"
          >
            Cancelar
          </v-btn>

          <v-btn 
            color="primary" 
            type="submit" 
            prepend-icon="mdi-content-save"
            class="text-capitalize font-weight-bold"
            :loading="cargando"
          >
            Guardar Cambios
          </v-btn>

        </v-card-actions>

      </v-form>

    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps(['usuario'])
const emit = defineEmits(['usuarioActualizado'])

const id_usuario = ref(null)
const id_rol = ref(null)
const nombre = ref('')
const correo = ref('')
const estado = ref(true)
const modelValue = ref(false)
const cargando = ref(false)
const formRef = ref(null) // Referencia para controlar las validaciones

const roles = ref([])

// Reglas de validación y seguridad
const reglas = {
  nombre: [
    v => !!v || 'El nombre completo es obligatorio',
    v => (v && v.trim().length >= 3) || 'Debe tener al menos 3 caracteres',
    v => !/[<>;"'=$%]/.test(v) || 'No se permiten caracteres especiales peligrosos'
  ],
  correo: [
    v => !!v || 'El correo electrónico es obligatorio',
    v => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) || 'El formato de correo no es válido'
  ],
  rol: [
    v => !!v || 'Seleccionar un rol es obligatorio'
  ]
}

// cargar datos cuando se abre
const cargarDialog = async () => {
  if (formRef.value) {
    formRef.value.resetValidation() // Limpia alertas rojas de errores previos
  }

  try {
    const respuesta = await axios.get("http://localhost:3000/roles")
    roles.value = respuesta.data

    modelValue.value = true

    id_usuario.value = props.usuario.id_usuario
    nombre.value = props.usuario.nombre || ""
    correo.value = props.usuario.correo || ""
    estado.value = props.usuario.estado !== undefined ? Boolean(props.usuario.estado) : true
    id_rol.value = props.usuario.id_rol || null
  } catch (error) {
    console.error("Error al cargar los roles", error)
    alert("No se pudieron cargar los roles del sistema.")
  }
}

const cerrar = () => {
  modelValue.value = false
}

// actualizar
const actualizarUsuario = async () => {
  if (!formRef.value) return

  // Validar visualmente el formulario antes de mandar la petición HTTP
  const { valid } = await formRef.value.validate()
  if (!valid) return

  cargando.value = true
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push({ name: 'inicioSesion'}); 
      return
    }

    // Limpieza de datos (Seguridad del lado del cliente)
    const datos = {
      nombre: nombre.value.trim(),
      correo: correo.value.trim().toLowerCase(),
      estado: estado.value,
      id_rol: id_rol.value
    }

    await axios.put(
      `http://localhost:3000/usuarios/${id_usuario.value}`,
      datos,
      {
        headers: { token: `Bearer ${token}` }
      }
    )

    emit('usuarioActualizado', {
      id_usuario: id_usuario.value,
      ...datos
    })
    
    cerrar()
  } catch (error) {
    console.error(error)
    
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.btn-animado {
  transition: transform 0.1s ease;
}
.btn-animado:hover {
  transform: scale(1.1);
}
</style>