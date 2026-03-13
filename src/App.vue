<script setup>
import leftheader from './components/Unnecessary/leftheader.vue'
import rightheader from './components/Headers/rightheader.vue'
import Counter from './components/Unnecessary/counter.vue'
import { useCounterStore } from '@/stores/counter'

import { RouterLink, RouterView } from 'vue-router'
// import { onMounted } from "vue";
// import { useAuthStore } from "@/stores/authStore.js";
//
//
// const auth = useAuthStore();
//
// onMounted(() => {
//     auth.fetchUser();
//     auth.fetchMoney();
// });
</script>

<template>

<div>
    <rightheader
        header = "Item Trading"
    ></rightheader></div>

    <RouterView />
</template>

<style scoped>
</style>

