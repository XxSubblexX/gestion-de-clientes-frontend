import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

// 1. Estilos y dependencias de Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css' 

// 2. Vistas del Router
import InicioSesion from './views/inicioSesion.vue'
import ClientesCRUD from './views/clientesCRUD.vue'

// Mantén tu importación original si el archivo está ahí arriba
import App from '../App.vue' 
import UsuariosCRUD from './views/usuariosCRUD.vue'

// 3. Configuración del Router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'inicioSesion', component: InicioSesion },
    { path: '/clientes', name: 'clientesCRUD', component: ClientesCRUD },
    { path: '/usuarios', name: 'usuariosCRUD', component: UsuariosCRUD}
  ]
})

// 4. Inicialización de Vuetify
const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
})

const app = createApp(App)

// 5. Registro de plugins en la app
app.use(router)
app.use(vuetify)

app.mount('#app')
