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

  <!-- Se agrega 'persistent' para evitar cierres accidentales -->
  <v-dialog v-model="modelValue" max-width="600" persistent>
    <v-card class="pa-5" rounded="xl" elevation="10">

      <!-- HEADER -->
      <v-card-title class="text-h5 font-weight-bold d-flex align-center text-grey-darken-4">
        <v-icon class="mr-2" color="primary" size="30">
          mdi-account-plus
        </v-icon>
        Registrar Cliente
      </v-card-title>

      <v-divider class="my-3" />
    
      <!-- FORM: Se añade la referencia 'formRef' -->
      <v-form ref="formRef" @submit.prevent="guardarCliente">

        <v-text-field
          v-model="formulario.nit"
          label="NIT"
          placeholder="Ej: 123456789-1"
          variant="outlined"
          class="mb-3"
          prepend-inner-icon="mdi-card-account-details"
          :rules="reglas.nit"
          hide-details="auto"
          maxlength="20"
        />

        <v-text-field
          v-model="formulario.razon_social"
          label="Razón Social"
          placeholder="Nombre de la empresa"
          variant="outlined"
          class="mb-3"
          prepend-inner-icon="mdi-domain"
          :rules="reglas.razonSocial"
          hide-details="auto"
          maxlength="100"
        />

        <v-text-field
          v-model="formulario.correo"
          label="Correo Electrónico"
          placeholder="correo@empresa.com"
          type="email"
          variant="outlined"
          class="mb-3"
          prepend-inner-icon="mdi-email"
          :rules="reglas.correo"
          hide-details="auto"
          maxlength="100"
        />

        <v-text-field
          v-model="formulario.telefono"
          type="number"
          label="Teléfono"
          placeholder="Ej: 3000000000"
          variant="outlined"
          class="mb-3"
          prepend-inner-icon="mdi-phone"
          :rules="reglas.telefono"
          hide-details="auto"
          maxlength="10"
        />

        <!-- BOTONES -->
        <v-card-actions class="px-0 pt-2">
          <v-spacer />

          <v-btn
            variant="text"
            color="grey-darken-1"
            @click="cerrarDialog"
            class="text-capitalize"
            :disabled="cargando"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="white"
            class="bg-primary text-capitalize font-weight-bold"
            type="submit"
            prepend-icon="mdi-content-save"
            :loading="cargando"
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

const emit = defineEmits(['clienteGuardado'])

const modelValue = ref(false)
const cargando = ref(false)
const formRef = ref(null) // Referencia para controlar el formulario

const abrirModalNuevo = () => {
  modelValue.value = true
}

const estadoInicialFormulario = () => ({
  nit: '',
  razon_social: '',
  correo: '',
  telefono: '',
  estado: true
})

const formulario = ref(estadoInicialFormulario())

// Reglas de validación y seguridad en el cliente
const reglas = {
  nit: [
    v => !!v || 'El NIT es obligatorio',
    v => /^[0-9\-]+$/.test(v) || 'El NIT solo debe contener números y guiones',
    v => (v && v.trim().length >= 5) || 'El NIT debe ser más largo'
  ],
  razonSocial: [
    v => !!v || 'La razón social es obligatoria',
    v => (v && v.trim().length >= 3) || 'Debe tener al menos 3 caracteres',
    v => !/[<>;"'=$%]/.test(v) || 'No se permiten caracteres especiales peligrosos'
  ],
  correo: [
    v => !!v || 'El correo electrónico es obligatorio',
    v => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) || 'El formato de correo no es válido'
  ],
  telefono: [
    v => !!v || 'El teléfono es obligatorio',
    v => (v && v.toString().length >= 7) || 'El número es muy corto'
  ]
}

const cerrarDialog = () => {
  modelValue.value = false
  if (formRef.value) {
    formRef.value.resetValidation() // Limpia los mensajes rojos de error al cerrar
  }
  formulario.value = estadoInicialFormulario()
}

const guardarCliente = async () => {
  if (!formRef.value) return

  // Validar visualmente el formulario antes de procesar la petición
  const { valid } = await formRef.value.validate()
  if (!valid) return

  cargando.value = true
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.')
      return
    }

    // Limpieza de espacios en blanco al inicio y al final (Seguridad de datos)
    const payload = {
      nit: formulario.value.nit.trim(),
      razon_social: formulario.value.razon_social.trim(),
      correo: formulario.value.correo.trim().toLowerCase(),
      telefono: formulario.value.telefono.toString().trim(),
      estado: formulario.value.estado
    }

    const res = await axios.post(
      'http://localhost:3000/clientes',
      payload,
      {
        headers: { token: `Bearer ${token}` } 
      }
    )

    emit('clienteGuardado', {
      id_cliente: res.data[0]?.id_cliente || null,
      ...payload
    })

    cerrarDialog()

  } catch (error) {
    console.error(error)
    alert('Error al registrar cliente. Verifica los datos e intenta de nuevo.')
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
/* Oculta flechas molestas en el campo de teléfono */
:deep(input::-webkit-outer-spin-button),
:deep(input::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}
</style>