<template>
  <!-- BOTÓN QUE ABRE EL MODAL -->
  <v-btn 
    color="primary" 
    prepend-icon="mdi-plus" 
    size="large"
    rounded="lg"
    elevation="2"
    @click="abrirModalNuevo"
  >
    Registrar Producto
  </v-btn>

  <!-- VENTANA DIALOG -->
  <v-dialog v-model="modelValue" max-width="600" persistent>
    <v-card class="pa-5" rounded="xl" elevation="10">

      <!-- HEADER (Calco exacto de la imagen) -->
      <v-card-title class="text-h5 font-weight-bold d-flex align-center text-grey-darken-4">
        <v-icon class="mr-2" color="primary" size="30">
          mdi-package-variant-plus
        </v-icon>
        Registrar Producto
      </v-card-title>

      <v-divider class="my-3" />

      <!-- FORM: Se añade la referencia 'formRef' -->
      <v-form ref="formRef" @submit.prevent="guardarProducto">

        <v-text-field
          v-model="nombre"
          label="Nombre del Producto"
          variant="outlined"
          class="mb-3"
          prepend-inner-icon="mdi-package-variant"
          :rules="reglas.nombre"
          hide-details="auto"
          maxlength="100"
        />

        <v-text-field
          v-model="descripcion"
          label="Descripción"
          variant="outlined"
          class="mb-3"
          prepend-inner-icon="mdi-text-box-outline"
          :rules="reglas.descripcion"
          hide-details="auto"
          maxlength="255"
        />

        <v-text-field
          v-model="caracteristicas"
          label="Características"
          variant="outlined"
          class="mb-3"
          prepend-inner-icon="mdi-format-list-bulleted"
          :rules="reglas.caracteristicas"
          hide-details="auto"
          maxlength="255"
        />

        <v-text-field
          v-model="precio"
          label="Precio de Venta"
          type="number"
          variant="outlined"
          class="mb-3"
          prepend-inner-icon="mdi-currency-usd"
          :rules="reglas.precio"
          hide-details="auto"
        />

        <!-- INPUT OCULTO CONTROLADO POR LA TARJETA -->
        <input
          type="file"
          ref="fileInputRef"
          accept="image/jpeg,image/png,image/webp"
          class="d-none"
          @change="manejarCambioArchivo"
        />

        <!-- ZONA DE VISTA PREVIA INTERACTIVA (Reemplaza al v-file-input) -->
        <v-card
          variant="flat"
          :color="foto ? 'grey-lighten-4' : 'blue-grey-lighten-5'"
          class="mb-1 d-flex flex-column align-center justify-center position-relative zona-subida"
          :class="{ 'cursor-pointer': !foto }"
          height="180"
          rounded="lg"
          @click="activarSelectorArchivo"
        >
          <!-- Vista si ya se seleccionó una foto -->
          <template v-if="foto">
            <v-img
              :src="crearUrlTemporal(foto)"
              height="100%"
              width="100%"
              cover
              class="rounded-lg"
            />
            <!-- Botón flotante para remover la foto rápido -->
            <v-btn
              icon="mdi-delete"
              size="small"
              color="error"
              variant="flat"
              class="position-absolute boton-eliminar"
              @click.stop="removerFoto"
            />
          </template>

          <!-- Vista vacía invitando a subir un archivo -->
          <template v-else>
            <v-icon size="48" color="primary" class="mb-2">mdi-cloud-upload-outline</v-icon>
            <span class="text-body-2 font-weight-medium text-grey-darken-2">Subir imagen del producto</span>
            <span class="text-caption text-grey-darken-1">Haz clic aquí para buscar (Formatos: JPG, PNG, WEBP)</span>
          </template>
        </v-card>
        
        <!-- Mensaje de error personalizado para la imagen -->
        <div v-if="errorFoto" class="text-caption text-error pl-3 mb-3 mt-1">
          {{ errorFoto }}
        </div>
        <div v-else class="mb-3"></div>

        <!-- BOTONES DE ACCIÓN ALINEADOS A LA DERECHA -->
        <v-card-actions class="px-0 pt-2">
          <v-spacer />

          <v-btn 
            variant="text" 
            color="grey-darken-1" 
            @click="cerrar" 
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
import { ref } from 'vue';
import axios from 'axios';

const nombre = ref("")
const descripcion = ref("")
const caracteristicas = ref("")
const precio = ref(null)
const foto = ref(null)

const modelValue = ref(false);
const cargando = ref(false);
const formRef = ref(null);
const fileInputRef = ref(null);
const errorFoto = ref("");

const emit = defineEmits(['productoGuardado'])

// Reglas de validación en texto y números
const reglas = {
  nombre: [
    v => !!v || 'El nombre del producto es obligatorio',
    v => (v && v.trim().length >= 3) || 'Debe tener al menos 3 caracteres',
    v => !/[<>;"'=$%]/.test(v) || 'No se permiten caracteres especiales peligrosos'
  ],
  descripcion: [
    v => !!v || 'La descripción es obligatoria',
    v => !/[<>;"'$%]/.test(v) || 'No se permiten caracteres especiales peligrosos'
  ],
  caracteristicas: [
    v => !!v || 'Las características son obligatorias',
    v => !/[<>;"'$%]/.test(v) || 'No se permiten caracteres especiales peligrosos'
  ],
  precio: [
    v => !!v || 'El precio es obligatorio',
    v => Number(v) > 0 || 'El precio debe ser un número mayor a 0'
  ]
}

// Disparar el selector de archivos al presionar la tarjeta
const activarSelectorArchivo = () => {
  if (!foto.value && fileInputRef.value) {
    fileInputRef.value.click();
  }
}

// Procesar y validar la imagen subida en tamaño y tipo
const manejarCambioArchivo = (event) => {
  const archivo = event.target.types ? event.target.files[0] : event.target.files[0];
  errorFoto.value = "";

  if (!archivo) return;

  // Validación de Formatos Seguros
  const formatosPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
  if (!formatosPermitidos.includes(archivo.type)) {
    errorFoto.value = "Solo se permiten imágenes en formato JPG, PNG o WEBP.";
    return;
  }

  // Validación de Tamaño Máximo (Ejemplo: 2MB)
  const limiteTamano = 2 * 1024 * 1024;
  if (archivo.size > limiteTamano) {
    errorFoto.value = "La imagen es muy pesada. El tamaño máximo permitido es de 2MB.";
    return;
  }

  foto.value = archivo;
}

const removerFoto = () => {
  foto.value = null;
  errorFoto.value = "";
  if (fileInputRef.value) {
    fileInputRef.value.value = ""; // Limpia el historial del input nativo
  }
}

// Función para generar la URL temporal de forma segura
const crearUrlTemporal = (archivo) => {
  if (!archivo) return '';
  return window.URL.createObjectURL(archivo);
}

const abrirModalNuevo = async () => {
  if (formRef.value) formRef.value.resetValidation();
  errorFoto.value = "";
  modelValue.value = true
}

const cerrar = () => {
  modelValue.value = false
  limpiarFormulario()
}

const limpiarFormulario = () => {
  nombre.value = ""
  descripcion.value = ""
  caracteristicas.value = ""
  precio.value = null
  removerFoto();
}

const guardarProducto = async () =>  {
  if (!formRef.value) return

  // Validar campos de texto primero
  const { valid } = await formRef.value.validate()
  
  // Validar manualmente que la foto exista antes de enviar
  if (!foto.value) {
    errorFoto.value = "La imagen del producto es obligatoria.";
    return;
  }

  if (!valid || errorFoto.value) return

  cargando.value = true;
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.')
      return
    }

    const formData = new FormData()
    formData.append('nombre', nombre.value.trim())
    formData.append('descripcion', descripcion.value.trim())
    formData.append('caracteristica', caracteristicas.value.trim())
    formData.append('precio_venta', Number(precio.value))
    formData.append('foto', foto.value)

    const respuesta = await axios.post("http://localhost:3000/productos", formData, {
      headers: { 
        token: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    emit('productoGuardado', respuesta.data)
    cerrar()
  } catch (error) {
    console.error("Error al registrar producto", error);
    alert("No se pudo registrar el producto. Intenta de nuevo.");
  } finally {
    cargando.value = false;
  }
}
</script>

<style scoped>
/* Oculta las flechas molestas del input de números */
:deep(input::-webkit-outer-spin-button),
:deep(input::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

/* Estilo personalizado con bordes discontinuos para la zona vacía */
.zona-subida {
  border: 2px dashed #b0bec5 !important;
  transition: all 0.3s ease;
}

.zona-subida:hover {
  border-color: #1867c0 !important;
  background-color: #e3f2fd !important;
}

.cursor-pointer {
  cursor: pointer;
}

/* Posición del botón flotante de borrado */
.boton-eliminar {
  top: 10px;
  right: 10px;
  z-index: 10;
}
</style>