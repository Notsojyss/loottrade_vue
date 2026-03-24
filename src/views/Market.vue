<script>
import axios from "axios";
import {useAuthStore} from "@/stores/authStore.js";
import { computed, onMounted } from "vue";
import { ref } from "vue";
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
            showModal: false,
            selectedItem: null,
            filteredListings: [],
            showSellModal: false,
            sellQuantity: 1,
            sellPrice: 0,
            showHistory: false,
            searchQuery: ""
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
            this.selectedItem = { name: itemName, id: itemId }; // Store both item name and ID
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
        async showHistoryModal(){

          this.showHistory = true;
            await this.authStore.fetchItemHistory(this.selectedItem.id);
        },
        /**
         * close history modal
         * @returns {Promise<void>}
         */
        async closeHistoryModal(){

          this.showHistory = false;
        },
        /**
         * Sell user's item
         * @returns {Promise<void>}
         */
        async handleSellItem() {
            try {

                await this.authStore.sellItem(this.selectedItem.id, this.sellQuantity, this.sellPrice);
                console.log(this.selectedItem.id);
                this.showSellModal = false;
                this.showItems =false;
            } catch (error) {
                console.error("Error selling item:", error);
            }
        },
        /**
         * for viewing Buy
         * @returns {Promise<void>}
         */
        async handleCurrentView(){
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
                @click="authStore.cancelListing(item.listing_id)"
                class="w-full rounded-lg bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600"
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
                class="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
            >
              Sell Item
            </button>
          </div>
        </div>

        <!-- Modal for selecting an item to sell -->
        <div
            v-if="showItems"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
            @click="showItems = false"
        >
          <div
              class="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-gray-900 p-4 shadow-2xl sm:p-6"
              @click.stop
          >
            <div class="mb-6 flex items-center justify-between border-b border-gray-700 pb-4">
              <h3 class="text-lg font-bold sm:text-xl">Select an Item to Sell</h3>
              <button
                  class="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                  @click="showItems = false"
              >
                Close
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
                    class="w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700"
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
        <div class="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-gray-900 p-4 shadow-2xl sm:p-6">
          <div class="mb-6 flex flex-col gap-3 border-b border-gray-700 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 class="text-lg font-bold sm:text-xl">
              Listings for {{ selectedItem.name }}
            </h2>

            <div class="flex flex-wrap gap-2">
              <button
                  class="rounded-lg bg-gray-700 px-4 py-2 font-medium text-white hover:bg-gray-600"
                  @click="showHistoryModal()"
              >
                History
              </button>
              <button
                  class="rounded-lg bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600"
                  @click="closeModal"
              >
                Close
              </button>
            </div>
          </div>

          <!-- History Overlay -->
          <div
              v-if="showHistory"
              class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 py-6"
              @click.self="showHistory = false"
          >
            <div class="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-gray-900 p-4 shadow-2xl sm:p-6">
              <div class="mb-6 flex items-center justify-between border-b border-gray-700 pb-4">
                <h3 class="text-lg font-bold sm:text-xl">Item History</h3>
                <button
                    class="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                    @click="closeHistoryModal()"
                >
                  Close
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
                    @click="handleBuyItem(listing)"
                    class="w-full rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
                >
                  Buy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
<style scoped>
.market-header {
    position: relative;
    color: #f5ff28;
    left: -500px;
    top: -20px;
    font-weight: bold;
    font-family: "Brush Script MT";
    text-align: center;
    font-size: 40px;
}
.market-container {
  position: relative;
  text-align: center;
  background: transparent;
  padding: 20px;
  min-width: 1528px;
  left: -156px;
  margin-top: 120px;
  max-height: 650px;
  min-height: 650px;
  max-width: 1200px;
  overflow-x: hidden;
  overflow-y: hidden;

}
.toggle-buttons button {

  background: yellow;
  position: relative;
  top: -55px;
  right: -475px;
  color: #222;
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  width: 120px;
  transition: background 0.2s;
  margin-right: 10px;
  margin-left: 1px;
}
.toggle-buttons button.active {
    background-color: #76f47c;
}
.sell-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
  justify-content: start;
  min-height: 400px ;
  max-height: 450px;
  width: 1200px;
  position: relative;

  top: -50px;
  right: -150px;
  background: linear-gradient(45deg, #373737 60%, #8f8f8f);


}
.sell-container-header{
  position: relative;
 color: whitesmoke;
  top: -40px;
  text-align: center;
  left: 500px;
  width: 200px;
  cursor: text;
}

.sell-grid {
  position: relative;
    display: flex;
    flex-direction: column; /* Ensures items are stacked vertically */
    justify-items: center;
    gap: 10px; /* Adds spacing between items */
  width: 1200px;
  min-height: 450px ;
  max-height: 450px;
  top: -40px;
  left: 20px;
}
.sell-grid-h3{
    min-width: 200px;
    text-align: left;
}.sell-grid-qty{
    min-width: 150px;
    text-align: left;
}

.sell-slot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8f9fa;
    padding: 15px;
  background: linear-gradient(135deg, #222, #444);
    text-align: center;
    min-height: 100px;
    max-height: 100px;
  border-radius: 5px;
  width: 1182px;
  border: #ffffff solid 2px;
  margin-left: -10px;
  position: relative;
  top:10px ;



    //min-height: 100px;
    //max-height: 100px;
}
.sell-slot h3, p{
  color: whitesmoke;
}

.item-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 5px;
  padding: 10px;
  background: #b5dddd;
}

button:hover {
    opacity: 0.9;
}
.modal-content-buy-list {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: fixed;
  background: linear-gradient(45deg, #373737 60%, #8f8f8f);
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    left: 362px;
    max-width: 1200px;
    min-width: 1200px;
    min-height: 620px;
    max-height: 620px;
    border: black solid 2px;
}
.modal-content-buy-list-header h2{
  color: whitesmoke;
}

.modal-content-buy-list .close-btn{
    position: absolute;
    top: 555px;
    right: 565px;
}

.listing-grid {
    display: flex;
    flex-direction: column;
    gap: 5px;
    justify-content: start;
    min-height: 450px ;
    max-height: 450px;
    width: 1200px;
  position: relative;

    top: -95px;
    right: -150px;
  overflow-y: auto;
  overflow-x: hidden;
  background: linear-gradient(45deg, #373737 60%, #8f8f8f);


}
.view-listing-btn{
position: fixed;
    margin-top: -20px;

}

.listing-card {
    padding: 15px;
    border-radius: 5px;
    width: 1162px;
    text-align: center;
    border: #ffffff solid 2px;
    min-height: 100px;
    max-height: 100px;
  margin-left: 12px;

  background: linear-gradient(135deg, #222, #444);
}

.listing-image {
    position: relative;
    left: -500px;
    top: -12px;
    width: 90px;
    height: 90px;
    border-radius: 5px;
  padding: 10px;
    object-fit: cover;
}

button {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 8px 12px;
    cursor: pointer;
}

button:hover {
    background-color: #45a049;
}



.listings-container {
    flex-grow: 1;  /* Takes up remaining space */
    overflow-y: auto;
    overflow-x: hidden;/* Enables scrolling */
    min-height: 360px;
    max-height: 360px;
    padding: 10px;
}

.listing-row {
    display: flex;
    align-items: center;
    gap: 15px;
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 5px;
  background: linear-gradient(135deg, #222, #444);
    width: 100%;
    min-width: 0;
    min-height: 100px;
    max-height: 100px;

}

.listing-image-small {
    width: 80px;
    height: 80px;
    border-radius: 5px;
}

.listing-details {

    flex: 1;
    text-align: left;
    min-width: 0;
}

.close-btn {
    position: absolute;
    top: 0px;
    right: 30px;
    background-color: red;
    color: white;
    padding: 8px 12px;
    border: none;
    cursor: pointer;
    font-weight: bold;
}
.listing-card .itemNameH3 {
    position: relative;
    top: -135px;
color: whitesmoke;
    font-weight: bold;
}
.listing-card .itemListing {
    position: relative;
    top: -75px;
    right: -330px;
  color: whitesmoke;
    font-size: 14px;
}
.listing-card .itemNametext {
    position: relative;
    top: -132px;
    font-weight: bold;
  color: whitesmoke;
}
.listing-card button {
    position: relative;
    top: -163px;
    right: -500px;
    font-weight: bold;
}
.listItemname{
    position: relative;
    text-align: center;
    top: 70px;
    right: 10px;
    width: 200px;
  color: whitesmoke;
  font-weight: bold;


}
 .listRarity{
    position: relative;
    top: 45px;
    right: -225px;
    width: 140px;
  color: whitesmoke;

}
 .listDescription{
    position: relative;
    text-align: center;
    top: 20px;
    right: -200px;
    width: 200px;
  color: whitesmoke;
}
 .listQuantity{
    position: relative;
    top: 20px;
    right: -380px;
  color: whitesmoke;
}
.listPrice{
    position: relative;
    display: flex;
    justify-content: center;  /* Center horizontally */
    align-items: center;
     top: -5px;
     right: -70px;
   color: whitesmoke;
 }
.listSeller{
    position: relative;
    top: -28px;
  color: whitesmoke;
    right: -700px;
}
.listing-details button{
    position: relative;
    top: -70px;
    right: -870px;
  width: 100px;
}
 .listing-image-small{
    height: 80px;
    max-width: 80px;
   padding: 8px;
   border: purple solid;
   background: #b5dddd;


}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Dark overlay */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}.modal-overlay-item-listing {
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   background: rgba(0, 0, 0, 0.5);
   display: flex;
   justify-content: center;
   align-items: center;
   z-index: 1000;
 }
.modal-content-sell-list {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: fixed;
  background: linear-gradient(45deg, #373737 60%, #8f8f8f);
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  left: 362px;
  max-width: 1200px;
  min-width: 1200px;
  min-height: 620px;
  max-height: 620px;
  border: black solid 2px;
}
.modal-content-sell-list .modal-content-sell-list-close-btn{
  position: absolute;
  top: 555px;
  right: 565px;
}

.modal-content-sell-input{
  background:#373737FF;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    padding: 2rem;
    width: 280px;
    text-align: center;
}
.modal-content-sell-input h3,
.modal-content-sell-input label{
  color: white;
}

.item-list{
    flex-grow: 1;  /* Takes up remaining space */
    overflow-y: auto;
    overflow-x: hidden;/* Enables scrolling */
    min-height: 400px;  /* Ensures it fills the modal */
    max-height: 400px;  /* Ensures it fills the modal */
    padding: 10px;

}


/* Flex container for each item */
.item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    padding: 10px;
    border-bottom: 1px solid #ccc;
  color: whitesmoke;

}

/* Item image styling */
.item-image {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 5px;
}



button {
    margin-top: 15px;
    padding: 8px 15px;
    background: #d9534f;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background: #c9302c;
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.popup-history {
    background: linear-gradient(45deg, #373737 60%, #8f8f8f);
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
    max-width: 800px;
    min-width: 800px;
    animation: fadeIn 0.3s ease-in-out;
    min-height: 400px;
    max-height: 400px;
    color: whitesmoke;
}
.market-history-table th{
    position: sticky;
    top: 0;
    background: grey;
    z-index: 10;
    padding: 10px;
    text-align: center;
    border-bottom: 2px solid #ddd;
}

.popup-header {
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
    margin-bottom: 10px;
}
.market-history-container{
    min-height:280px;
    max-height: 280px;
    overflow-x: hidden;
    overflow-y: auto;
}
.market-history-table {
    width: 100%;
    border-collapse: collapse;

}
 .market-history-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;


}


.show-history-close-btn {
    position: relative;
    top: 335px;
    right: 50px;
    background: red;
    color: white;
    border: none;
    padding: 5px 6px;
    cursor: pointer;
    border-radius: 5px;
}

.no-history-message {
    text-align: center;
    padding: 10px;
    color: #777;
}

/* Fade-in animation */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
.market-listings-header{
  color: whitesmoke;
  position: relative;
  top: -50px;
 }
.search-input {
  width: 62.5%;
  position: relative;
  top: -90.5px;
  left: -130px;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background: linear-gradient(135deg, #222, #444);
  font-size: 16px;
  color: whitesmoke;
}
.modal-content-sell-list-header{
  color: whitesmoke;
}
.modal-content-sell-input input[type="number"]::-webkit-outer-spin-button,
.modal-content-sell-input input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
.price-sell{
    position: relative;
    display: flex;
    align-items: center;
    min-width: 200px;
    text-align: left;
}
.rarity-epic {
    background: linear-gradient(135deg, rgba(243, 85, 243, 0.95), rgba(234, 228, 234, 0.8));
    color: black;
}

.rarity-legendary {
    background: linear-gradient(135deg, #f7d700, #ffd700, #ff9900);
    color: black;
}

.rarity-rare {
    background: linear-gradient(135deg, #4d8ee6, #6bb7d3);
    color: black;
}

.rarity-uncommon {
    background: linear-gradient(135deg, #56ab2f, #a8e063);
    color: black;
}

.rarity-common {
    background: linear-gradient(135deg, #f0f0f0, #ffffff);
    color: black;
}
</style>

