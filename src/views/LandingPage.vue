<script setup>
import { useAuthStore } from '@/stores/authStore.js'; // Import the store if needed
const authStore = useAuthStore();
</script>

<template>
  <!-- Landing Page -->
  <div class="min-h-screen bg-gray-900 text-white px-4 py-10">

    <!-- Header Section -->
    <div class="text-center max-w-3xl mx-auto">
      <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold">
        Welcome to <span class="text-red-400">Loot Trade</span>
      </h1>

      <p class="mt-4 text-sm sm:text-base md:text-lg text-gray-300">
        Trade, buy, and sell game items in a virtual marketplace!
      </p>
    </div>

    <!-- Features Grid -->
    <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">

      <!-- Item Shop -->
      <RouterLink to="/shop"
                  class="feature-card bg-gray-800 hover:bg-gray-700 transition rounded-xl p-5 shadow-md">
        <h2 class="text-lg sm:text-xl font-semibold mb-3 text-red-400">Item Shop</h2>
        <ul class="text-sm text-gray-300 space-y-1">
          <li>Purchase exclusive items using your coins.</li>
          <li>Discover rare and valuable items.</li>
        </ul>
      </RouterLink>

      <!-- Marketplace -->
      <RouterLink to="/market"
                  class="feature-card bg-gray-800 hover:bg-gray-700 transition rounded-xl p-5 shadow-md">
        <h2 class="text-lg sm:text-xl font-semibold mb-3 text-red-400">Marketplace</h2>
        <ul class="text-sm text-gray-300 space-y-1">
          <li>List items for sale</li>
          <li>Browse and buy items from other users</li>
          <li>See listed items</li>
          <li>View purchase history</li>
        </ul>
      </RouterLink>

      <!-- PvP -->
      <RouterLink to="/pvp"
                  class="feature-card bg-gray-800 hover:bg-gray-700 transition rounded-xl p-5 shadow-md">
        <h2 class="text-lg sm:text-xl font-semibold mb-3 text-red-400">Earn Coins with PvP</h2>
        <ul class="text-sm text-gray-300 space-y-1">
          <li>Challenge players in Rock-Paper-Scissors</li>
          <li>Win battles to earn coins</li>
        </ul>
      </RouterLink>

      <!-- Inventory -->
      <RouterLink to="/inventory"
                  class="feature-card bg-gray-800 hover:bg-gray-700 transition rounded-xl p-5 shadow-md">
        <h2 class="text-lg sm:text-xl font-semibold mb-3 text-red-400">Inventory</h2>
        <ul class="text-sm text-gray-300 space-y-1">
          <li>Track your owned assets</li>
        </ul>
      </RouterLink>

    </div>
  </div>
</template>


