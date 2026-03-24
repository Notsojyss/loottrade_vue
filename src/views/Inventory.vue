<script>
import axios from "axios";
import {useAuthStore} from "@/stores/authStore.js";
import { computed, onMounted } from "vue";

export default {
    name: "Inventory",
    setup() {
        const authStore = useAuthStore();
        const items = computed(() => authStore.items);
        onMounted(() => {
             authStore.fetchUserItems();
        });
        return { authStore,items };
    },
    data (){
        return {
            showInfoModal: false,
            selectedItem: null
        }
    },
    computed:{
        sortedItems() {
            const rarityOrder = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
            return this.items.slice().sort((a, b) => {
                return (
                    rarityOrder.indexOf(a.rarity.toLowerCase()) -
                    rarityOrder.indexOf(b.rarity.toLowerCase())
                );
            });
        }
    },
    methods: {
        rarityClass(rarity) {
            switch (rarity) {
                case 'epic':
                    return 'rarity-epic';
                case 'legendary':
                    return 'rarity-legendary';
                case 'rare':
                    return 'rarity-rare';
                case 'uncommon':
                    return 'rarity-uncommon';
                case 'common':
                    return 'rarity-common';
                default:
                    return '';
            }
        },
        openInfoModal(item) {
            this.selectedItem = item;
            this.showInfoModal = true;
        },
        closeInfoModal() {
            this.showInfoModal = false;
            this.selectedItem = null;
        },

    }
};
</script>

<template>
  <div class="min-h-screen bg-gray-900 px-4 py-6 text-white">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <h1 class="mb-8 text-center text-3xl font-bold sm:text-4xl">
        MY INVENTORY
      </h1>

      <!-- Items Grid -->
      <div
          v-if="items.filter(i => i.item_name).length > 0"
          class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <div
            v-for="item in sortedItems"
            :key="item.item_name"
            :class="['rounded-2xl border bg-gray-800 p-4 shadow-lg', rarityClass(item.rarity)]"
        >
          <div class="mb-3">
            <h2 class="text-center text-lg font-bold sm:text-xl">
              {{ item.item_name }}
            </h2>
          </div>

          <div class="mb-4 flex flex-col items-center">
            <img
                :src="item.image"
                :alt="item.item_name"
                class="h-32 w-auto object-contain sm:h-36 md:h-40"
            />
            <p class="mt-3 text-sm text-gray-300 sm:text-base">
              You have: {{ item.quantity }}
            </p>
          </div>

          <div>
            <button
                class="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
                @click="openInfoModal(item)"
            >
              Info
            </button>
          </div>
        </div>
      </div>

      <p v-else class="text-center text-gray-300">No items found.</p>
    </div>
  </div>

  <!-- Info Modal -->
  <div
      v-if="showInfoModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      @click.self="closeInfoModal"
  >
    <div
        class="w-full max-w-md rounded-2xl border bg-gray-900 p-5 text-white shadow-2xl"
        :class="rarityClass(selectedItem?.rarity)"
    >
      <h2 class="mb-4 text-center text-xl font-bold sm:text-2xl">
        {{ selectedItem?.item_name }}
      </h2>

      <div class="mb-5 flex justify-center">
        <img
            :src="selectedItem?.image"
            :alt="selectedItem?.item_name"
            class="h-36 w-auto object-contain sm:h-40"
        />
      </div>

      <div class="space-y-3 text-sm sm:text-base">
        <p><strong>Description:</strong> {{ selectedItem?.description }}</p>
        <p><strong>Rarity:</strong> {{ selectedItem?.rarity }}</p>
        <p><strong>You have:</strong> {{ selectedItem?.quantity }}</p>
      </div>

      <button
          class="mt-6 w-full rounded-lg bg-red-500 px-4 py-3 font-medium text-white hover:bg-red-600"
          @click="closeInfoModal"
      >
        Close
      </button>
    </div>
  </div>
</template>


