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
      <v-form @submit.prevent="actualizarCliente">

        <v-text-field
          v-model="nit"
          label="NIT"
          variant="outlined"
          class="mb-3"
          prepend-inner-icon="mdi-card-account-details"
        />

        <v-text-field
          v-model="razonSocial"
          label="Razón Social"
          variant="outlined"
          class="mb-3"
          prepend-inner-icon="mdi-domain"
        />

        <v-text-field
          v-model="correo"
          label="Correo Electrónico"
          type="email"
          variant="outlined"
          class="mb-3"
          prepend-inner-icon="mdi-email"
        />

        <v-text-field
          v-model="telefono"
          label="Teléfono"
          variant="outlined"
          class="mb-3"
          prepend-inner-icon="mdi-phone"
        />

        <v-switch
          v-model="estado"
          label="Cliente Activo"
          color="primary"
          inset
          class="mb-4"
        />

        <!-- BOTONES -->
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

const props = defineProps(['cliente'])


const emit = defineEmits(['clienteActualizado'])

const nit = ref('')
const razonSocial = ref('')
const correo = ref('')
const telefono = ref('')
const estado = ref(true)
const modelValue = ref(false)



// cargar datos cuando se abre
const cargarDialog = () => {
  modelValue.value = true

  nit.value = props.cliente.nit
  razonSocial.value = props.cliente.razon_social
  telefono.value = props.cliente.telefono
  correo.value = props.cliente.correo
  estado.value = props.cliente.estado
}

const cerrar = () => {
  modelValue.value = false
}


// actualizar
const actualizarCliente = async () => {
  try {

    const datos = {
      nit: nit.value,
      razon_social: razonSocial.value,
      correo: correo.value,
      telefono: telefono.value,
      estado: estado.value
    }

    await axios.put(
      `http://localhost:3000/clientes/${props.cliente.id_cliente}`,
      datos,
      {
        headers: { token: `Bearer ${localStorage.getItem("token")}` }
      }
    )

    emit('clienteActualizado', {
      id_cliente: props.cliente.id_cliente,
      ...datos
    })
    
    cerrar()
  } catch (error) {
    console.error(error)
    alert("Error al actualizar cliente")
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