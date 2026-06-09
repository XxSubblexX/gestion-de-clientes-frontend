<template>
                <v-btn
    icon="mdi-pencil"
    variant="text"
    color="primary"
    class="btn-animado mr-1"
    @click="cargarDialog()"
  />  
  
  <v-dialog v-model="modelValue" max-width="600">
    <v-card class="pa-5" rounded="xl" elevation="10">

      <!-- HEADER -->
      <v-card-title class="text-h5 font-weight-bold d-flex align-center">
        <v-icon class="mr-2" color="primary">
          mdi-account-edit
        </v-icon>
        Actualizar Cliente
      </v-card-title>

      <v-divider class="my-3" />

      <!-- FORM -->
      <v-form @submit.prevent="actualizarUsuario">

        <v-text-field
            v-model="nombre"
            label="Nombre Completo"
            type="text"
            variant="outlined"
            prepend-inner-icon="mdi-account-outline"
            class="mb-2"
            required
          />

          <!-- Campo Correo -->
          <v-text-field
            v-model="correo"
            label="Correo Electrónico"
            type="email"
            variant="outlined"
            prepend-inner-icon="mdi-email-outline"
            class="mb-2"
            required
          />

          <!-- Campo Contraseña con opción de ocultar/mostrar -->
          <v-select
            :items="roles"
            item-title="id_nombre"
            item-value="id_rol"
            v-model="id_rol"
            label="Rol"
            variant="outlined"
            prepend-inner-icon="mdi-account"
            class="mb-4"
            required
          />

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



        <v-card-actions class="px-0">
          <v-spacer />

          <v-btn variant="text" color="grey" @click="cerrar()">
            Cancelar
          </v-btn>

          <v-btn color="primary" type="submit" prepend-icon="mdi-content-save">
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

const props = defineProps(['usuario'])


const emit = defineEmits(['usuarioActualizado'])

const id_usuario = ref(null)
const id_rol = ref(null)
const nombre = ref('')
const correo = ref('')
const estado = ref(true)
const modelValue = ref(false)

const roles = ref([])

// cargar datos cuando se abre
const cargarDialog = async () => {

    const respuesta = await axios.get("http://localhost:3000/roles")
    roles.value = respuesta.data

    modelValue.value = true

    id_usuario.value = props.usuario.id_usuario
    nombre.value = props.usuario.nombre
    correo.value = props.usuario.correo
    estado.value = props.usuario.estado
    id_rol.value = props.usuario.id_rol
}

const cerrar = () => {
  modelValue.value = false
}


// actualizar
const actualizarUsuario = async () => {
  try {

    const datos = {
      nombre: nombre.value,
      correo: correo.value,
      estado: estado.value,
      id_rol: id_rol.value
    }

    await axios.put(
      `http://localhost:3000/usuarios/${id_usuario.value}`,
      datos,
      {
        headers: { token: `Bearer ${localStorage.getItem("token")}` }
      }
    )

    emit('usuarioActualizado', {
      id_usuario: id_usuario.value,
      ...datos
    })
    
    cerrar()
  } catch (error) {
    console.error(error)
    alert("Error al actualizar usuario")
  }
}
</script>

<style scoped>
.btn-eliminar {
  cursor: pointer;
  background: none;
  border: none;
  font-size: 16px;
  padding: 4px 8px;
  transition: transform 0.1s ease;
}
.btn-eliminar:hover {
  transform: scale(1.15);
}</style>