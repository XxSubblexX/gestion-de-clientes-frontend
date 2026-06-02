<template>
  <v-dialog v-model="dialog" max-width="600">
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
import { ref, computed } from 'vue'
import axios from 'axios'

const props = defineProps({
  modelValue: Boolean,
  idUsuario: [Number, String]
})

const emit = defineEmits(['update:modelValue', 'clienteGuardado'])

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formulario = ref({
  nit: '',
  razon_social: '',
  correo: '',
  telefono: '',
  estado: true
})

const cerrarDialog = () => {
  dialog.value = false
}

const guardarCliente = async () => {
  try {
    const token = localStorage.getItem("token")

    const payload = {
      ...formulario.value,
      id_usuario: props.idUsuario
    }

    const res = await axios.post(
      'http://localhost:3000/clientes',
      payload,
      {
        headers: { token: `Bearer ${token}` }
      }
    )

    emit('clienteGuardado', {
      id_cliente: res.data.id_cliente,
      ...payload
    })

    formulario.value = {
      nit: '',
      razon_social: '',
      correo: '',
      telefono: '',
      estado: true
    }

    cerrarDialog()

  } catch (error) {
    console.error(error)
    alert('Error al registrar cliente')
  }
}
</script>