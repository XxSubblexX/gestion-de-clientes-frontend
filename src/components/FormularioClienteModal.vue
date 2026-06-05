<template>
   <v-btn 
            color="primary" 
            prepend-icon="mdi-plus" 
            size="large"
            rounded="lg"
            elevation="2"
            @click="abrirModalNuevo"
          >
            Registrar Cliente
          </v-btn>
  <v-dialog v-model="modelValue" max-width="600">
    <v-card class="pa-5" rounded="xl" elevation="10">

      <!-- HEADER -->
      <v-card-title class="text-h5 font-weight-bold d-flex align-center">
        <v-icon class="mr-2" color="primary">
          mdi-account-plus
        </v-icon>
        Registrar Cliente
      </v-card-title>

      <v-divider class="my-3" />
    
      <!-- FORM -->
      <v-form @submit.prevent="guardarCliente">

        <v-text-field
          v-model="formulario.nit"
          label="NIT"
          placeholder="Ej: 123456789-1"
          variant="outlined"
          class="mb-3"
          prepend-inner-icon="mdi-card-account-details"
        />

        <v-text-field
          v-model="formulario.razon_social"
          label="Razón Social"
          placeholder="Nombre de la empresa"
          variant="outlined"
          class="mb-3"
          prepend-inner-icon="mdi-domain"
        />

        <v-text-field
          v-model="formulario.correo"
          label="Correo Electrónico"
          placeholder="correo@empresa.com"
          type="email"
          variant="outlined"
          class="mb-3"
          prepend-inner-icon="mdi-email"
        />

        <v-text-field
          v-model="formulario.telefono"
          label="Teléfono"
          placeholder="Ej: 600 000 000"
          variant="outlined"
          class="mb-3"
          prepend-inner-icon="mdi-phone"
        />

        <!-- BOTONES -->
        <v-card-actions class="px-0">
          <v-spacer />

          <v-btn
            variant="text"
            color="grey"
            @click="cerrarDialog"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="primary"
            type="submit"
            prepend-icon="mdi-content-save"
          >
            Guardar Cliente
          </v-btn>

        </v-card-actions>

      </v-form>

    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

// Eliminamos computed porque no lo estabas usando
const emit = defineEmits(['clienteGuardado'])

const modelValue = ref(false)

const abrirModalNuevo = () => {
  modelValue.value = true
}

// Estado inicial limpio para reutilizar fácilmente
const estadoInicialFormulario = () => ({
  nit: '',
  razon_social: '',
  correo: '',
  telefono: '',
  estado: true
})

const formulario = ref(estadoInicialFormulario())

const cerrarDialog = () => {
  modelValue.value = false
}

const guardarCliente = async () => {
  try {
    // CORRECCIÓN: Obtener el string y parsearlo a objeto de forma segura
    const infoLocalStorage = localStorage.getItem("info")
    if (!infoLocalStorage) {
      alert('No se encontró información de la sesión del usuario')
      return
    } 

    const payload = {
      ...formulario.value,
    }

    const res = await axios.post(
      'http://localhost:3000/clientes',
      payload,
      {
        headers: {token: `Bearer ${localStorage.getItem("token")}` } 
      }
    )

    emit('clienteGuardado', {
      id_cliente: res.data[0].id_cliente,
      ...payload
    })

    // Limpieza de formulario usando la función constructora
    formulario.value = estadoInicialFormulario()
    cerrarDialog()

  } catch (error) {
    console.error(error)
    alert('Error al registrar cliente')
  }
}
</script>
