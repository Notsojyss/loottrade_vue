<script>
import axios from "axios";
import { useAuthStore } from "@/stores/authStore.js"; // Import Pinia store

export default {
    name: "ShopView",
    setup() {
        const authStore = useAuthStore();
        return { authStore };
    },
    data() {
        return {
            items: [],
            quantities: {} ,// Store quantities for each item
            showModal: false, // Whether to show the modal or not
            selectedItem: null,
        };
    },
    computed: {
        user() {
            return this.authStore.user;
        },
        /**
         * sorts the items based on rarity
         * @returns {*[]}
         */
        sortedItems() {
            const rarityOrder = ['legendary', 'epic', 'rare', 'uncommon', 'common'];

            return this.items.slice().sort((a, b) => {
                const rarityComparison = rarityOrder.indexOf(a.rarity.toLowerCase()) - rarityOrder.indexOf(b.rarity.toLowerCase());

                if (rarityComparison === 0) {
                    return b.price - a.price;
                }
                return rarityComparison;
            });
        }
    },
    mounted() {
        this.fetchItems();
    },
    methods: {
        /**
         * fetch the items from items ofc shop
         * @returns {Promise<void>}
         */
        async fetchItems() {
            try {
                const response = await axios.get(
                    import.meta.env.VITE_API_URL+ "/api/item/get-shopitems"
                );
                this.items = response.data;

                // Initialize quantities for each item
                this.items.forEach(item => {
                    this.quantities[item.id] = 1;
                });
            } catch (error) {
                console.error("Error fetching items:", error);
            }
        },
        /**
         * for quantity input; increase
         * @param itemId
         */
        increaseQuantity(itemId) {
            this.quantities[itemId]++;
        },
        /**
         * for quantity input; decrease
         * @param itemId
         */
        decreaseQuantity(itemId) {
            if (this.quantities[itemId] > 1) {
                this.quantities[itemId]--;
            }
        },
        /**
         * open quantity modal
         * @param item
         */
        openQuantityModal(item) {
            this.selectedItem = item; // Set the selected item to the one clicked
            this.showModal = true; // Show the modal
        },
        /**
         * close modal
         */
        closeModal() {
            this.showModal = false;
            this.selectedItem = null;
        },
        /**
         * to implement buyItem to items from shop
         * @returns {Promise<void>}
         */
        async handleBuyItemfromShop() {
            if (this.selectedItem) {
                await this.authStore.buyItem({
                    id: this.selectedItem.id,
                    quantity: this.quantities[this.selectedItem.id],
                    idType: 'item_id',
                    fromMarket: false
                });
                await this.authStore.fetchMoney();
                this.closeModal();
            }
        },
        /**
         * to be Used for items background color; class naming
         * @param rarity
         * @returns {string}
         */
        rarityClass(rarity) {
            switch (rarity.toLowerCase()) {
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
        /**
         * To shorten the description
         * @param shortenText
         * @returns {string|*}
         */
        shorten(shortenText) {
            // Ensure that hostname is a string before checking its length
            return typeof shortenText === 'string' && shortenText.length > 10
                ? shortenText.substring(0, 70) + "..."
                : shortenText;
        }
    }

};
</script>


<template>
  <div class="min-h-screen bg-gray-900 px-4 py-6 text-white">
    <div class="mx-auto max-w-7xl">
      <!-- Title -->
      <h1 class="mb-8 text-center text-3xl font-bold sm:text-4xl">
        ITEM SHOP
      </h1>

      <!-- Item List -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div
            v-for="item in sortedItems"
            :key="item.id"
            :class="['rounded-2xl border bg-gray-800 p-4 shadow-lg', rarityClass(item.rarity)]"
        >
          <h2 class="mb-3 text-center text-lg font-bold sm:text-xl">
            {{ item.item_name }}
          </h2>

          <div class="mb-4 flex justify-center">
            <img
                :src="item.image"
                :alt="item.name"
                class="h-32 w-auto object-contain sm:h-36 md:h-40"
            />
          </div>

          <p class="mb-5 text-center text-sm text-gray-300 sm:text-base">
            {{ shorten(item.description) }}
          </p>

          <button
              class="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
              @click="openQuantityModal(item)"
          >
            <img
                alt="Coin Image"
                class="h-6 w-6"
                src="/src/assets/rotating-coin.gif"
            />
            {{ item.price }}
          </button>
        </div>
      </div>

      <!-- Modal for Quantity Input -->
      <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
          @click="closeModal"
      >
        <div
            class="w-full max-w-md rounded-2xl bg-gray-900 p-5 shadow-2xl"
            @click.stop
        >
          <h3 class="mb-5 text-center text-lg font-bold sm:text-xl">
            Enter Quantity for {{ selectedItem?.item_name }}
          </h3>

          <div class="mb-5 flex items-center justify-center gap-3">
            <button
                @click="decreaseQuantity(selectedItem.id)"
                class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-700 text-xl font-bold hover:bg-gray-600"
            >
              -
            </button>

            <input
                type="number"
                v-model="quantities[selectedItem.id]"
                min="1"
                class="w-24 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-center outline-none focus:border-blue-500"
            />

            <button
                @click="increaseQuantity(selectedItem.id)"
                class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-700 text-xl font-bold hover:bg-gray-600"
            >
              +
            </button>
          </div>

          <p class="mb-6 flex items-center justify-center gap-2 text-center text-base font-semibold text-yellow-400 sm:text-lg">
            Total Price:
            <img
                alt="Coin Image"
                class="h-5 w-5"
                src="/src/assets/rotating-coin.gif"
            />
            {{ selectedItem?.price * quantities[selectedItem.id] }}
          </p>

          <div class="flex flex-col gap-3 sm:flex-row">
            <button
                @click="handleBuyItemfromShop()"
                class="w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700"
            >
              Confirm Purchase
            </button>

            <button
                @click="closeModal"
                class="w-full rounded-lg bg-red-500 px-4 py-3 font-medium text-white hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

