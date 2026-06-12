<template>
  <!-- BOTÓN QUE ABRE EL MODAL -->
  <v-btn
    icon="mdi-pencil"
    variant="text"
    color="primary"
    class="btn-animado mr-1"
    @click="abrirModalNuevo"
  />  

  <!-- VENTANA DIALOG -->
  <v-dialog v-model="modelValue" max-width="600" persistent>
    <v-card class="pa-5" rounded="xl" elevation="10">

      <!-- HEADER (Calco exacto de la imagen) -->
      <v-card-title class="text-h5 font-weight-bold d-flex align-center text-grey-darken-4">
        <v-icon class="mr-2" color="primary" size="30">
          mdi-package-variant-plus
        </v-icon>
        Actualizar Producto
      </v-card-title>

      <v-divider class="my-3" />

      
      <v-form ref="formRef" @submit.prevent="guardarProducto">

        <!-- CONTENEDOR DE LA IMAGEN EN FORMA CIRCULAR PREMIUM E INTERACTIVA -->
        <div class="d-flex flex-column align-center mb-6">
          <div class="position-relative">
            <v-avatar 
              size="140" 
              class="elevation-4 bg-grey-lighten-4 border-xl border-white cursor-pointer"
              @click="activarSelectorArchivo"
            >
              <!-- 1. SI EL USUARIO SELECCIONÓ UNA FOTO NUEVA -->
              <v-img
                v-if="fotoNueva"
                :src="crearUrlTemporal(fotoNueva)"
                cover
              ></v-img>

              <!-- 2. SI NO HA SELECCIONADO NADA (MUESTRA LA FOTO VIEJA) -->
              <v-img
                v-else-if="foto"
                :src="foto"
                cover
              ></v-img>

              <!-- 3. SI NO HAY IMAGEN EN ABSOLUTO -->
              <div v-else class="d-flex flex-column align-center justify-center text-grey-darken-1">
                <v-icon size="40">mdi-image-outline</v-icon>
              </div>
            </v-avatar>

            <!-- BOTÓN FLOTANTE PARA BORRAR LA SELECCIÓN NUEVA (VUELVE A LA FOTO ANTERIOR) -->
            <v-btn
              v-if="fotoNueva"
              icon="mdi-close"
              size="small"
              color="error"
              variant="flat"
              class="position-absolute visual-delete-btn"
              @click.stop="removerFotoNueva"
            />
          </div>
          
          <!-- Mensaje descriptivo o de error debajo del círculo -->
          <div v-if="errorFoto" class="text-caption text-error mt-2 font-weight-medium">
            {{ errorFoto }}
          </div>
          <div v-else class="text-caption text-grey-darken-1 mt-2">
            {{ fotoNueva ? 'Nueva imagen lista' : `Archivo actual: ${nombreFoto || 'Ninguno'}` }}
          </div>
        </div>

        <!-- INPUT NATIVO OCULTO -->
        <input
          type="file"
          ref="fileInputRef"
          accept="image/jpeg,image/png,image/webp"
          class="d-none"
          @change="manejarCambioArchivo"
        />

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

        <!-- SWITCH DE ESTADO -->
        <div class="d-flex align-center pl-1 mb-4">
          <v-switch 
            v-model="estado" 
            :label="estado ? 'Producto Activo' : 'Producto Inactivo'"
            color="success"
            base-color="error"
            inset
            hide-details
            class="font-weight-bold mb-4"
            prepend-inner-icon="mdi-toggle-switch-outline"
          ></v-switch>
        </div>

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
const estado = ref(null)
const nombreFoto = ref("")
const fotoNueva = ref(null)

const modelValue = ref(false);
const cargando = ref(false);
const formRef = ref(null);
const fileInputRef = ref(null);
const errorFoto = ref("");

const URL = window.URL
const props = defineProps(['producto'])
const emit = defineEmits(['productoActualizado'])

// Reglas de seguridad y formato
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

// Disparar selector de archivos oculto al hacer clic en el avatar
const activarSelectorArchivo = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
}

// Validar peso y tipo de archivo subido
const manejarCambioArchivo = (event) => {
  const listaArchivos = event.target.files;
  errorFoto.value = "";

  if (!listaArchivos || listaArchivos.length === 0) return;
  const archivo = listaArchivos[0];

  // Controlar extensiones seguras
  const formatosPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
  if (!formatosPermitidos.includes(archivo.type)) {
    errorFoto.value = "Formatos válidos: JPG, PNG o WEBP.";
    return;
  }

  // Controlar tamaño máximo (2MB)
  const limiteTamano = 2 * 1024 * 1024;
  if (archivo.size > limiteTamano) {
    errorFoto.value = "La imagen supera el límite máximo de 2MB.";
    return;
  }

  fotoNueva.value = archivo;
}

const removerFotoNueva = () => {
  fotoNueva.value = null;
  errorFoto.value = "";
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
}

const crearUrlTemporal = (archivo) => {
  if (!archivo) return '';
  return window.URL.createObjectURL(archivo);
}

const abrirModalNuevo = async () => {
  if (formRef.value) formRef.value.resetValidation();
  errorFoto.value = "";
  
  modelValue.value = true
  nombre.value = props.producto.nombre || ""
  descripcion.value = props.producto.descripcion || ""
  caracteristicas.value = props.producto.caracteristicas || ""
  precio.value = props.producto.precio_venta || null
  foto.value = props.producto.fotografia_principal_url || null
  estado.value = props.producto.estado !== undefined ? props.producto.estado : true

  if (foto.value?.startsWith('http')) {
    const url = new URL(foto.value)
    nombreFoto.value = url.pathname.split('-').pop()
  } else {
    nombreFoto.value = "Sin archivo previo"
  }
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
  removerFotoNueva();
}

const guardarProducto = async () =>  {
  if (!formRef.value) return

  // Validar campos de texto y reglas
  const { valid } = await formRef.value.validate()
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
    formData.append('nombreFoto', nombreFoto.value)
    formData.append('foto', foto.value)
    formData.append('estado', estado.value)
  
    if (fotoNueva.value) {
      formData.append('fotoNueva', fotoNueva.value);
    }

    const respuesta = await axios.put(`http://localhost:3000/productos/${props.producto.id_producto}`, formData, {
      headers: { 
        token: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    emit('productoActualizado', respuesta.data)
    cerrar()
  } catch (error) {
    console.error("Error al actualizar producto", error);
    alert("No se pudieron guardar los cambios. Intenta de nuevo.");
  } finally {
    cargando.value = false;
  }
}
</script>

<style scoped>
:deep(input::-webkit-outer-spin-button),
:deep(input::-webkit-inner-spin-button) 

{-webkit-appearance: none;margin: 0;}

.cursor-pointer {cursor: pointer;}
.visual-delete-btn {top: 0;right: calc(50% - 70px)
    ;z-index: 2;}
</style>