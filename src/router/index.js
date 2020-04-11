import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Room from '../views/Room.vue'
import Test from '../views/Test.vue'
import Room2 from '../views/Room2.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/rooms/:room',
        name: 'Room',
        component: Room
    },
    {
        path: '/rooms2/:room',
        name: 'Room2',
        component: Room2
    },
    {
        path: '/rooms/',
        name: 'Test',
        component: Test
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
