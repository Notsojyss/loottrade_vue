<script>
import axios from "axios";
import {useAuthStore} from "@/stores/authStore.js";
import { computed, onMounted } from "vue";
import { ref } from "vue";
import { useToast } from "vue-toastification";
export default {
    name: "Market",
    setup() {
        const authStore = useAuthStore();
        const userItemsForSale = computed(() => authStore.userItemsForSale);
        const items = computed(() => authStore.items);
        const listings = computed(() => authStore.listings);
        const itemhistory = computed(() => authStore.itemhistory);
        const groupedListings = computed(() => authStore.groupedListings);
        const showItems = ref(false);
        onMounted(() => {
            authStore.fetchUserItemsForSale();
            authStore.fetchUserItems();
            authStore.fetchListings();
        });
        return { authStore,userItemsForSale,showItems,items,listings, groupedListings,itemhistory  };
    },
    data() {
        return {

            currentView: "buy",
            pendingBuyListing: null,
            showBuyConfirmModal: false,
            showModal: false,
            selectedItem: null,
            filteredListings: [],
            showSellModal: false,
            sellQuantity: 1,
            sellPrice: 0,
            showHistory: false,
            searchQuery: "",
            showCancelListingModal: false,
            pendingCancelListing: null,
        };
    },
    computed: {
        user() {
            return this.authStore.user;
        },
        filteredListings() {
            return this.listings.filter(listing =>
                this.selectedItem && listing.item_name === this.selectedItem.name
            )
        },
        filteredGroupedListings() {
            if (!this.searchQuery) return this.groupedListings;
            return this.groupedListings.filter(item =>
                item.item_name.toLowerCase().startsWith(this.searchQuery.toLowerCase())
            );
        },
        listingCounts() {
            const counts = {};
            this.listings.forEach(listing => {
                if (!counts[listing.item_id]) {
                    counts[listing.item_id] = 0;
                }
                counts[listing.item_id] += 1;
            });
            return counts;
        }
    },
    methods: {
      /**
       * open modal for selling item
       * @param item
       */
      openSellModal(item) {

        this.selectedItem = item;
        this.sellQuantity = 1;
        this.sellPrice = 0;
        this.showSellModal = true;
      },
      /**
       * shorten texts
       * @param shortenText
       * @returns {string|*}
       */
      shorten(shortenText) {
        return typeof shortenText === 'string' && shortenText.length > 6
            ? shortenText.substring(0, 6) + "..."
            : shortenText;
      },
      /**
       * opens a modal that shows the user's items
       */
      handlePlaceClick() {
        this.authStore.fetchUserItems();
        this.showItems = true;
      },
      /**
       * open the modal to show the filtered items
       * @param itemName
       * @param itemId
       */
      openModal(itemName, itemId) {
        this.selectedItem = {name: itemName, id: itemId}; // Store both item name and ID
        this.filteredListings = this.listings.filter(listing => listing.item_name === itemName);
        this.showModal = true;
        this.authStore.fetchListings();
      },
      /**
       * close modal
       */
      closeModal() {
        this.showModal = false;
        this.selectedItem = null;
        this.filteredListings = [];
      },
      /**
       * open the history modal
       * @returns {Promise<void>}
       */
      async showHistoryModal() {

        this.showHistory = true;
        await this.authStore.fetchItemHistory(this.selectedItem.id);
      },
      /**
       * close history modal
       * @returns {Promise<void>}
       */
      async closeHistoryModal() {

        this.showHistory = false;
      },
      /**
       * Sell user's item
       * @returns {Promise<void>}
       */
      async handleSellItem() {
        const toast = useToast();

        try {
          await this.authStore.sellItem(
              this.selectedItem.id,
              this.sellQuantity,
              this.sellPrice
          );

          this.showSellModal = false;
          this.showItems = false;

          // ✅ SUCCESS
          toast.success(
              `Listed ${this.sellQuantity}x ${this.selectedItem.item_name} for sale!`
          );

        } catch (error) {
          console.error("Error selling item:", error);

          // ❌ ERROR HANDLING
          if (error.response?.status === 400) {
            toast.error(error.response.data.message || "Invalid sell request.");
          } else if (error.response?.status === 401) {
            toast.error("Unauthorized. Please log in.");
          } else {
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Failed to sell item."
            );
          }
        }
      },
      /**
       * for viewing Buy
       * @returns {Promise<void>}
       */
      async handleCurrentView() {
        this.currentView = 'buy';
        this.authStore.fetchListings();

      },
      /**
       * buying item from the market
       * @param listing
       * @returns {Promise<void>}
       */
      async handleBuyItem(listing) {

        try {
          if (confirm(`Are you sure you want to buy this "${listing.item_name}"?`)) {
            await this.authStore.buyItem({
              id: listing.id,
              quantity: listing.quantity,
              idType: 'listing_id'
            });

            await this.authStore.fetchListings();
            await this.authStore.fetchMoney();

            this.filteredListings = this.listings.filter(item => item.item_name === this.selectedItem.name);
          }
        } catch (error) {
          console.error("Purchase failed:", error);
        }
      },
      /**
       * rarity css class for items
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
      openBuyConfirmModal(listing) {
        this.pendingBuyListing = listing;
        this.showBuyConfirmModal = true;
      },

      closeBuyConfirmModal() {
        this.pendingBuyListing = null;
        this.showBuyConfirmModal = false;
      },
      async confirmBuyItem() {
        const toast = useToast();
        const boughtItemName = this.pendingBuyListing.item_name;
        if (!this.pendingBuyListing) return;

        try {


          await this.authStore.buyItem({
            id: this.pendingBuyListing.id,
            quantity: this.pendingBuyListing.quantity,
            idType: "listing_id"
          });

          await this.authStore.fetchListings();
          await this.authStore.fetchMoney();

          this.filteredListings = this.listings.filter(
              item => item.item_name === this.selectedItem.name
          );

          this.closeBuyConfirmModal();

          toast.success(`Purchased ${boughtItemName}!`);
        } catch (error) {
          console.error("Purchase failed:", error);

          if (error.response?.status === 400) {
            toast.error(error.response.data.error || "You cannot purchase this item.");
          } else if (error.response?.status === 401) {
            toast.error("Unauthorized. Please log in.");
          } else if (error.response?.status === 404) {
            toast.error("Item or listing not found.");
          } else {
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Purchase failed."
            );
          }
        }
      },
      openCancelListingModal(item) {
        this.pendingCancelListing = item;
        this.showCancelListingModal = true;
      },

      closeCancelListingModal() {
        this.pendingCancelListing = null;
        this.showCancelListingModal = false;
      },
      async confirmCancelListing() {
        const toast = useToast();

        if (!this.pendingCancelListing) return;

        try {
          const itemName = this.pendingCancelListing.item_name;

          await this.authStore.cancelListing(this.pendingCancelListing.listing_id);

          this.closeCancelListingModal();

          toast.success(`${itemName} listing cancelled successfully!`);
        } catch (error) {
          console.error("Error canceling listing:", error);

          if (error.response?.status === 401) {
            toast.error("Unauthorized. Please log in.");
          } else if (error.response?.status === 404) {
            toast.error("Listing not found.");
          } else {
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Failed to cancel listing."
            );
          }
        }
      }
    }
};
</script>

<template>
  <div class="min-h-screen bg-gray-900 px-4 py-6 text-white">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <h2 class="mb-6 text-center text-2xl font-bold sm:text-3xl">MARKET</h2>

      <!-- Toggle Buttons -->
      <div class="mb-6 flex justify-center">
        <div class="flex w-full max-w-md overflow-hidden rounded-xl bg-gray-800">
          <button
              :class="[
              'w-1/2 px-4 py-3 text-sm font-semibold transition sm:text-base',
              currentView === 'buy'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            ]"
              @click="this.handleCurrentView()"
          >
            Buy
          </button>

          <button
              :class="[
              'w-1/2 px-4 py-3 text-sm font-semibold transition sm:text-base',
              currentView === 'sell'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            ]"
              @click="currentView = 'sell'"
          >
            Sell
          </button>
        </div>
      </div>

      <!-- BUY VIEW -->
      <div v-if="currentView === 'buy'">
        <div class="mb-6">
          <input
              v-model="searchQuery"
              type="text"
              placeholder="Search for an item..."
              class="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-400 focus:border-blue-500 sm:text-base"
          />
        </div>

        <div
            v-if="filteredGroupedListings.length > 0"
            class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <div
              v-for="item in filteredGroupedListings"
              :key="item.item_name"
              class="rounded-2xl border border-gray-700 bg-gray-800 p-4 shadow-lg"
          >
            <div class="mb-4 flex justify-center">
              <img
                  :src="item.image"
                  :alt="item.item_name"
                  :class="['h-32 w-auto object-contain sm:h-36', rarityClass(item.rarity)]"
              />
            </div>

            <h3 class="mb-2 text-center text-sm font-medium text-gray-300">
              Available Listing {{ listingCounts[item.item_id] || 0 }}
            </h3>

            <h3 class="text-center text-xs uppercase tracking-wide text-gray-400">
              Item
            </h3>

            <h2 class="mb-4 text-center text-lg font-bold text-white">
              {{ item.item_name }}
            </h2>

            <button
                class="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
                @click="openModal(item.item_name, item.item_id)"
            >
              View Listings
            </button>
          </div>
        </div>

        <p v-else class="text-center text-gray-300"></p>
      </div>

      <!-- SELL VIEW -->
      <div v-if="currentView === 'sell'" class="mt-6">
        <h2 class="mb-6 text-center text-xl font-bold sm:text-2xl">Sell Items</h2>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div
              v-for="(item, index) in userItemsForSale"
              :key="index"
              class="rounded-2xl border border-gray-700 bg-gray-800 p-4 shadow-lg"
          >
            <div class="mb-4 flex justify-center">
              <img
                  v-if="item.image"
                  :src="item.image"
                  alt="Item Image"
                  :class="['h-28 w-auto object-contain sm:h-32', rarityClass(item.rarity)]"
              />
            </div>

            <h3 class="mb-2 text-center text-lg font-semibold">{{ item.item_name }}</h3>

            <p class="mb-2 flex items-center justify-center gap-2 text-yellow-400">
              Price Each:
              <img
                  alt="Coin Image"
                  class="h-6 w-6"
                  src="/src/assets/rotating-coin.gif"
              />
              {{ item.price }}
            </p>

            <p class="mb-2 text-center">Quantity: {{ item.quantity }}</p>

            <p class="mb-4 flex items-center justify-center gap-2 text-yellow-400">
              Total:
              <img
                  alt="Coin Image"
                  class="h-6 w-6"
                  src="/src/assets/rotating-coin.gif"
              />
              {{ item.price * item.quantity }}
            </p>

            <button
                @click="openCancelListingModal(item)"
                class="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
            >
              Cancel
            </button>
          </div>

          <!-- Empty Slots -->
          <div
              v-for="n in Math.max(4 - userItemsForSale.length, 0)"
              :key="'empty-' + n"
              class="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-600 bg-gray-800 p-4 text-center"
          >
            <p class="mb-4 text-gray-400">Empty</p>
            <button
                @click="handlePlaceClick()"
                class="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
            >
              Sell Item
            </button>
          </div>
        </div>
        <div
            v-if="showCancelListingModal"
            class="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 py-6"
            @click.self="closeCancelListingModal"
        >
          <div class="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-5 text-white shadow-2xl">
            <h3 class="mb-4 text-center text-xl font-bold">
              Cancel Listing
            </h3>

            <div v-if="pendingCancelListing" class="mb-5">
              <div class="mb-4 flex justify-center">
                <img
                    v-if="pendingCancelListing.image"
                    :src="pendingCancelListing.image"
                    :alt="pendingCancelListing.item_name"
                    :class="['h-24 w-auto object-contain', rarityClass(pendingCancelListing.rarity)]"
                />
              </div>

              <div class="space-y-2 text-center text-sm sm:text-base">
                <p>
                  <span class="text-gray-400">Item:</span>
                  <span class="ml-1 font-semibold">{{ pendingCancelListing.item_name }}</span>
                </p>
                <p>
                  <span class="text-gray-400">Quantity:</span>
                  <span class="ml-1 font-semibold">{{ pendingCancelListing.quantity }}</span>
                </p>
                <p class="flex items-center justify-center gap-2 text-yellow-400">
                  <span class="text-gray-400">Price Each:</span>
                  <img
                      alt="Coin Image"
                      class="h-5 w-5"
                      src="/src/assets/rotating-coin.gif"
                  />
                  {{ pendingCancelListing.price }}
                </p>
              </div>
            </div>

            <p class="mb-6 text-center text-sm text-gray-300">
              Are you sure you want to cancel this listing?
            </p>

            <div class="flex flex-col gap-3 sm:flex-row">
              <button
                  @click="confirmCancelListing"
                  class="w-full rounded-lg bg-red-500 px-4 py-3 font-medium text-white hover:bg-red-600"
              >
                Confirm
              </button>

              <button
                  @click="closeCancelListingModal"
                  class="w-full rounded-lg bg-gray-700 px-4 py-3 font-medium text-white hover:bg-gray-600"
              >
                Back
              </button>
            </div>
          </div>
        </div>
        <!-- Modal for selecting an item to sell -->
        <div
            v-if="showItems"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
            @click="showItems = false"
        >
          <div
              class="relative max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-gray-900 p-4 text-white shadow-2xl sm:p-6"
              @click.stop
          >
            <div class="mb-6 flex items-center justify-between border-b border-gray-700 pb-4">
              <h3 class="text-lg font-bold sm:text-xl">Select an Item to Sell</h3>
              <button
                  class="absolute right-4 top-4 text-gray-400 hover:text-white text-2xl font-bold"
                  @click="showItems = false"
              >
                ✕
              </button>
            </div>

            <div
                v-if="items.filter(i => i.item_name).length > 0"
                class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              <div
                  v-for="item in items.filter(i => i.item_name)"
                  :key="item.id"
                  class="rounded-2xl border border-gray-700 bg-gray-800 p-4"
              >
                <div class="mb-4 flex justify-center">
                  <img
                      :src="item.image"
                      :alt="item.item_name"
                      :class="['h-28 w-auto object-contain sm:h-32', rarityClass(item.rarity)]"
                  />
                </div>

                <h3 class="mb-2 text-center text-lg font-semibold">{{ item.item_name }}</h3>
                <p class="mb-2 text-center text-sm text-gray-300">Rarity: {{ item.rarity }}</p>
                <p class="mb-4 text-center font-medium">Quantity: {{ item.quantity }}</p>

                <button
                    @click="openSellModal(item)"
                    class="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  Sell
                </button>
              </div>
            </div>

            <p v-else class="text-center text-gray-300">No items found.</p>
          </div>
        </div>

        <!-- Modal for entering quantity and price -->
        <div
            v-if="showSellModal"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
        >
          <div
              class="w-full max-w-md rounded-2xl bg-gray-900 p-5 shadow-2xl"
              @click.stop
          >
            <h3 class="mb-5 text-center text-lg font-bold">
              Sell {{ selectedItem?.item_name }}
            </h3>

            <div class="space-y-4">
              <div>
                <label class="mb-2 block text-sm font-medium">Quantity:</label>
                <input
                    type="number"
                    v-model="sellQuantity"
                    :max="selectedItem?.quantity"
                    min="1"
                    class="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium">Price per Item:</label>
                <input
                    type="number"
                    v-model="sellPrice"
                    min="0.01"
                    step="0.01"
                    class="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div class="flex flex-col gap-3 sm:flex-row">
                <button
                    @click="handleSellItem()"
                    class="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
                >
                  Confirm Sell
                </button>
                <button
                    @click="showSellModal = false"
                    class="w-full rounded-lg bg-red-500 px-4 py-3 font-medium text-white hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal for Item Listings -->
      <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
          @click.self="showModal = false"
      >
        <div class="relative max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-gray-900 p-4 text-white shadow-2xl sm:p-6">
          <div class="mb-6 flex flex-col gap-3 border-b border-gray-700 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 class="text-lg font-bold sm:text-xl">
              Listings for {{ selectedItem.name }}
            </h2>

            <div class="flex flex-wrap gap-2">
              <button
                  class="absolute right-14 top-4  rounded-lg bg-gray-700 px-4 py-2 font-medium text-white hover:bg-gray-600"
                  @click="showHistoryModal()"
              >
                History
              </button>
              <button
                  class="absolute right-4 top-4 text-gray-400 hover:text-white text-2xl font-bold"
                  @click="closeModal"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- History Overlay -->
          <div
              v-if="showHistory"
              class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 py-6"
              @click.self="showHistory = false"
          >
            <div class="relative max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-gray-900 p-4 text-white shadow-2xl sm:p-6">
              <div class="mb-6 flex items-center justify-between border-b border-gray-700 pb-4">
                <h3 class="text-lg font-bold sm:text-xl">Item History</h3>
                <button
                    class="absolute right-4 top-4 text-gray-400 hover:text-white text-2xl font-bold"
                    @click="closeHistoryModal()"
                >
                  ✕
                </button>
              </div>

              <div v-if="loading" class="text-center text-white">Loading history...</div>

              <div v-else-if="itemhistory.length > 0" class="overflow-x-auto">
                <table class="min-w-full border-collapse text-sm text-white">
                  <thead>
                  <tr class="bg-gray-800">
                    <th class="px-4 py-3 text-left">Item Name</th>
                    <th class="px-4 py-3 text-left">Price Per Item</th>
                    <th class="px-4 py-3 text-left">Quantity</th>
                    <th class="px-4 py-3 text-left">Sold on</th>
                    <th class="px-4 py-3 text-left">Seller</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr
                      v-for="history in itemhistory"
                      :key="history.id"
                      class="border-t border-gray-700"
                  >
                    <td class="px-4 py-3">{{ history.item_name }}</td>
                    <td class="px-4 py-3">{{ history["price per item"] }}</td>
                    <td class="px-4 py-3">{{ history.quantity }}</td>
                    <td class="px-4 py-3">{{ history.market_updated_at }}</td>
                    <td class="px-4 py-3">{{ history.username }}</td>
                  </tr>
                  </tbody>
                </table>
              </div>

              <div v-else class="text-center text-gray-300">No history available.</div>
            </div>
          </div>

          <!-- Listings Container -->
          <div class="space-y-4">
            <div
                v-for="listing in filteredListings"
                :key="listing.id"
                class="flex flex-col gap-4 rounded-2xl border border-gray-700 bg-gray-800 p-4 sm:flex-row sm:items-center"
            >
              <div class="flex justify-center sm:w-32 sm:shrink-0">
                <img
                    :src="listing.image"
                    :alt="listing.item_name"
                    :class="['h-24 w-auto object-contain', rarityClass(listing.rarity)]"
                />
              </div>

              <div class="flex-1">
                <h3 class="mb-2 text-lg font-bold">{{ listing.item_name }}</h3>
                <p class="text-sm text-gray-300"><strong>Rarity:</strong> {{ listing.rarity }}</p>
                <p class="text-sm text-gray-300"><strong>Quantity:</strong> {{ listing.quantity }}</p>
                <p class="mt-1 flex items-center gap-2 text-sm text-yellow-400">
                  <strong class="text-white">Price:</strong>
                  <img
                      alt="Coin Image"
                      class="h-5 w-5"
                      src="/src/assets/rotating-coin.gif"
                  />
                  {{ listing.price * listing.quantity }} coins
                </p>
                <p class="text-sm text-gray-300">
                  <strong>Seller:</strong> {{ shorten(listing.username) }}
                </p>
              </div>

              <div class="sm:w-36">
                <button
                    @click="openBuyConfirmModal(listing)"
                    class="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
                >
                  Buy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
        v-if="showBuyConfirmModal"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 py-6"
        @click.self="closeBuyConfirmModal"
    >
      <div class="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-5 text-white shadow-2xl">
        <h3 class="mb-4 text-center text-xl font-bold">
          Confirm Purchase
        </h3>

        <div v-if="pendingBuyListing" class="mb-5">
          <div class="mb-4 flex justify-center">
            <img
                :src="pendingBuyListing.image"
                :alt="pendingBuyListing.item_name"
                :class="['h-24 w-auto object-contain', rarityClass(pendingBuyListing.rarity)]"
            />
          </div>

          <div class="space-y-2 text-center text-sm sm:text-base">
            <p>
              <span class="text-gray-400">Item:</span>
              <span class="ml-1 font-semibold">{{ pendingBuyListing.item_name }}</span>
            </p>
            <p>
              <span class="text-gray-400">Quantity:</span>
              <span class="ml-1 font-semibold">{{ pendingBuyListing.quantity }}</span>
            </p>
            <p class="flex items-center justify-center gap-2 text-yellow-400">
              <span class="text-gray-400">Total:</span>
              <img
                  alt="Coin Image"
                  class="h-5 w-5"
                  src="/src/assets/rotating-coin.gif"
              />
              {{ pendingBuyListing.price * pendingBuyListing.quantity }}
            </p>
            <p>
              <span class="text-gray-400">Seller:</span>
              <span class="ml-1 font-semibold">{{ shorten(pendingBuyListing.username) }}</span>
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row">
          <button
              @click="confirmBuyItem"
              class="w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700"
          >
            Confirm
          </button>

          <button
              @click="closeBuyConfirmModal"
              class="w-full rounded-lg bg-red-500 px-4 py-3 font-medium text-white hover:bg-red-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


