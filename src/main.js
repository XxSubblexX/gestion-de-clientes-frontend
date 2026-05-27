import './assets/main.css'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

// 1. Importas tus dos vistas por separado
import InicioSesion from './views/inicioSesion.vue'
import ClientesCRUD from './views/clientesCRUD.vue'
import RegistrarCuenta from './views/registrarCuenta.vue'
import UsuarioUpdate from './views/usuarioUpdate.vue'
import NuevoCLiente from './views/nuevoCLiente.vue'

import App from '../App.vue'


// 2. Creas el router aquí mismo
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'inicioSesion', component: InicioSesion },
    { path: '/clientes', name: 'clientesCRUD', component: ClientesCRUD },
    { path: '/register', name: 'registrarCuenta', component: RegistrarCuenta},
    { path: '/user', name: 'usuarioUpdate', component: UsuarioUpdate},
    { path: '/nuevo_cliente', name: 'nuevoCliente', component: NuevoCLiente}
  ]
})

const app = createApp(App)

app.use(router) // 3. Vinculas el router correcto
app.mount('#app')
