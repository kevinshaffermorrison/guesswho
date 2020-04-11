import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Room from '../views/Room.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/rooms/:room',
        name: 'Room',
        component: Room
    },
    {
        path: '/',
        name: 'Home',
        component: Home,
    }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router;
