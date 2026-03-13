<script setup>

</script>

<template>

    <div class =" counter">
        <p>Count: {{ counterStore.count }}</p>
        <p>Double Count: {{ counterStore.doubleCount }}</p>
        <button @click="counterStore.increment">Increment</button></div>



</template>

<style scoped>

</style>
