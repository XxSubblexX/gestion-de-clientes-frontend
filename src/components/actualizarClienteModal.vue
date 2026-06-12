<template>
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
        Actualizar Cliente
      </v-card-title>

      <v-divider class="my-3" />

      <!-- FORM: Se añade la referencia 'formRef' -->
      <v-form ref="formRef" @submit.prevent="actualizarCliente">

        <v-text-field
          v-model="nit"
          label="NIT"
          variant="outlined"
          class="mb-3"
          prepend-inner-icon="mdi-card-account-details"
          :rules="reglas.nit"
          hide-details="auto"
          maxlength="10"
        />

        <v-text-field
          v-model="razonSocial"
          label="Razón Social"
          variant="outlined"
          class="mb-3"
          prepend-inner-icon="mdi-domain"
          :rules="reglas.razonSocial"
          hide-details="auto"
          maxlength="100"
        />

        <v-text-field
          v-model="correo"
          label="Correo Electrónico"
          type="email"
          variant="outlined"
          class="mb-3"
          prepend-inner-icon="mdi-email"
          :rules="reglas.correo"
          hide-details="auto"
          maxlength="100"
        />

        <v-text-field
          v-model="telefono"
          type="number"
          label="Teléfono"
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

const props = defineProps(['cliente'])
const emit = defineEmits(['clienteActualizado'])

const nit = ref('')
const razonSocial = ref('')
const correo = ref('')
const telefono = ref('')
const estado = ref(true)
const modelValue = ref(false)
const cargando = ref(false)
const formRef = ref(null) // Referencia para controlar las validaciones

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

// cargar datos cuando se abre
const cargarDialog = () => {
  if (formRef.value) {
    formRef.value.resetValidation() // Limpia alertas de errores previas
  }
  
  modelValue.value = true

  nit.value = props.cliente.nit || ''
  razonSocial.value = props.cliente.razon_social || ''
  telefono.value = props.cliente.telefono || ''
  correo.value = props.cliente.correo || ''
  estado.value = props.cliente.estado !== undefined ? props.cliente.estado : true
}

const cerrar = () => {
  modelValue.value = false
}

// actualizar
const actualizarCliente = async () => {
  if (!formRef.value) return

  // Validar visualmente el formulario antes de mandar la petición HTTP
  const { valid } = await formRef.value.validate()
  if (!valid) return

  cargando.value = true
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.')
      return
    }

    // Limpieza de datos (Seguridad del lado del cliente)
    const datos = {
      nit: nit.value.trim(),
      razon_social: razonSocial.value.trim(),
      correo: correo.value.trim().toLowerCase(),
      telefono: telefono.value.toString().trim(),
      estado: estado.value
    }

    await axios.put(
      `http://localhost:3000/clientes/${props.cliente.id_cliente}`,
      datos,
      {
        headers: { token: `Bearer ${token}` }
      }
    )
    
    emit('clienteActualizado', {
      id_cliente: props.cliente.id_producto || props.cliente.id_cliente, // Asegura el ID correcto
      ...datos
    })
    
    cerrar()
  } catch (error) {
    console.error(error)
    alert("Error al actualizar cliente. Verifica los datos e intenta de nuevo.")
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
/* Oculta las flechas molestas del input de números en el teléfono */
:deep(input::-webkit-outer-spin-button),
:deep(input::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

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
}
</style>