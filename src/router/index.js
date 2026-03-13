import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import calculatorApp from "@/components/Unnecessary/calculatorApp.vue";
import { useAuthStore } from '@/stores/authStore.js';
import LandingPage from "@/views/LandingPage.vue";
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            redirect: "/loginform",
        },
        {
            name: "registrationform",
            path: "/registrationform",
            component: ()=>import('@/components/Forms/registrationform.vue')
        },
        {
            name: "loginform",
            path: "/loginform",
            component: ()=>import('@/components/Forms/loginform.vue'),
             meta: { requiresGuest: true }
        },
        {
            name: "LandingPage",
            path: "/landingpage",
            component: ()=>import('@/views/LandingPage.vue'),
            meta: { requiresAuth: true }
        },
        {
            name: "Shop",
            path: "/shop",
            component: ()=>import('@/views/ShopView.vue'),
            meta: { requiresAuth: true }
        },
        {
            name: "Inventory",
            path: "/inventory",
            component: ()=>import('@/views/Inventory.vue'),
            meta: { requiresAuth: true }
        },
        {
            name: "Market",
            path: "/market",
            component: ()=>import('@/views/Market.vue'),
            meta: { requiresAuth: true }
        },
        {
            name: "PvpBattle",
            path: "/pvp",
            component: ()=>import('@/views/PvpBattle.vue'),
            meta: { requiresAuth: true }
        },{
            name: "Profile",
            path: "/profile",
            component: ()=>import('@/views/UserProfile.vue'),
            meta: { requiresAuth: true }
        }

    ],
})
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const isAuthenticated = !!localStorage.getItem("auth_token"); // Check token presence

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/loginform');
    } else if (to.meta.requiresGuest && isAuthenticated) {
        next('/landingpage');
    } else if (to.meta.requiresGuest && isAuthenticated) {
        next('/shop');
    } else {
        next(); // Allow navigation
    }
});
export default router
