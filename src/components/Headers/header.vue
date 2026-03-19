<script setup>
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { ref, computed, onMounted } from "vue";

const authStore = useAuthStore();
const router = useRouter();

const dropdownOpen = ref(false);
const mobileMenuOpen = ref(false);
const user = computed(() => authStore.user);
const money = computed(() => authStore.money);

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const handleLogout = () => {
  authStore.logout(router);
};

const goToProfile = () => {
  router.push("/profile");
};

const shorten = (text) => {
  return typeof text === "string" && text.length > 14
      ? text.substring(0, 10) + ".."
      : text;
};

onMounted(() => {
  authStore.fetchUser();
  authStore.fetchMoney();
});
</script>

<template>
  <header class="bg-gray-900 text-white shadow-md">
    <div class="flex items-center justify-between px-4 py-3 sm:px-6">
      <!-- Logo -->
      <RouterLink to="/landingpage" class="flex items-center gap-2 shrink-0">
        <img
            src="@/assets/LTlogo.png"
            class="w-14 h-auto sm:w-16"
            alt="loottrade logo"
        />
      </RouterLink>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium">
        <RouterLink to="/pvp" class="hover:text-red-400 transition-colors">PVP Battle</RouterLink>
        <RouterLink to="/landingpage" class="hover:text-red-400 transition-colors">Home</RouterLink>
        <RouterLink to="/market" class="hover:text-red-400 transition-colors">Marketplace</RouterLink>
        <RouterLink to="/shop" class="hover:text-red-400 transition-colors">Shop</RouterLink>
        <RouterLink to="/inventory" class="hover:text-red-400 transition-colors">Inventory</RouterLink>
      </nav>

      <!-- Desktop Right Side -->
      <div class="hidden md:flex items-center gap-3 lg:gap-4">
        <!-- Money -->
        <div v-if="user" class="flex items-center gap-2 text-yellow-400">
          <img src="@/assets/coin.gif" class="w-5 h-5 sm:w-6 sm:h-6" alt="coin gif" />
          <span class="text-sm sm:text-base">{{ money }}</span>
        </div>

        <!-- Not logged in -->
        <div v-if="!user" class="flex gap-2">
          <RouterLink
              to="/loginform"
              class="px-3 py-1.5 bg-blue-500 rounded hover:bg-blue-600 transition-colors text-sm"
          >
            Login
          </RouterLink>
          <RouterLink
              to="/registrationform"
              class="px-3 py-1.5 bg-green-500 rounded hover:bg-green-600 transition-colors text-sm"
          >
            Register
          </RouterLink>
        </div>

        <!-- Logged in -->
        <div v-else class="relative">
          <button
              @click="toggleDropdown"
              class="px-3 py-1.5 bg-gray-700 rounded hover:bg-gray-600 transition-colors text-sm"
          >
            {{ shorten(user.full_name) }}
          </button>

          <div
              v-if="dropdownOpen"
              class="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-md z-50"
          >
            <button
                @click="goToProfile"
                class="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              View Profile
            </button>
            <button
                @click="handleLogout"
                class="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu Button -->
      <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2 rounded hover:bg-gray-800"
      >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
          <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <div v-if="mobileMenuOpen" class="md:hidden px-4 pb-4">
      <nav class="flex flex-col gap-2 text-sm font-medium">
        <RouterLink to="/pvp" class="hover:text-red-400 py-2">PVP Battle</RouterLink>
        <RouterLink to="/landingpage" class="hover:text-red-400 py-2">Home</RouterLink>
        <RouterLink to="/market" class="hover:text-red-400 py-2">Marketplace</RouterLink>
        <RouterLink to="/shop" class="hover:text-red-400 py-2">Shop</RouterLink>
        <RouterLink to="/inventory" class="hover:text-red-400 py-2">Inventory</RouterLink>
      </nav>

      <div class="mt-4 flex flex-col gap-3">
        <!-- Money -->
        <div v-if="user" class="flex items-center gap-2 text-yellow-400">
          <img src="@/assets/coin.gif" class="w-5 h-5" alt="coin gif" />
          <span>{{ money }}</span>
        </div>

        <!-- Not logged in -->
        <div v-if="!user" class="flex flex-col gap-2">
          <RouterLink
              to="/loginform"
              class="px-3 py-2 bg-blue-500 rounded hover:bg-blue-600 text-center"
          >
            Login
          </RouterLink>
          <RouterLink
              to="/registrationform"
              class="px-3 py-2 bg-green-500 rounded hover:bg-green-600 text-center"
          >
            Register
          </RouterLink>
        </div>

        <!-- Logged in -->
        <div v-else class="flex flex-col gap-2">
          <button
              @click="goToProfile"
              class="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600 text-left"
          >
            View Profile
          </button>
          <button
              @click="handleLogout"
              class="px-3 py-2 bg-red-500 rounded hover:bg-red-600 text-left"
          >
            <Logout></Logout>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>

</style>