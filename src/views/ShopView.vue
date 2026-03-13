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
    <div class="shop-container">
        <h1 class="shop-title">ITEM SHOP</h1>
        <div class="item-list">
            <div v-for="item in sortedItems" :key="item.id" :class="['item', rarityClass(item.rarity)]">
                <h2>{{ item.item_name }}</h2>
                <img :src="item.image" :alt="item.name" class="itemimg" />
                <p class="description"> {{ shorten(item.description) }}</p>

                <br />
                <button class="item-list-buy-btn" @click="openQuantityModal(item)"> <img alt="Coin Image" class="coin-icon" src="/src/assets/rotating-coin.gif" width="30" height="30" />{{ item.price }}</button>
            </div>
        </div>

        <!-- Modal for Quantity Input -->
        <div v-if="showModal" class="modal-overlay" @click="closeModal">
            <div class="modal-content" @click.stop>
                <h3>Enter Quantity for {{ selectedItem?.item_name }}</h3>
                <div class="quantity-container">
                    <button @click="decreaseQuantity(selectedItem.id)">-</button>
                    <input type="number" v-model="quantities[selectedItem.id]" min="1" />
                    <button @click="increaseQuantity(selectedItem.id)">+</button>
                </div>

                <br />
                <p class=" total-price"> Total Price : <img alt="Coin Image" class="coin-icon" src="/src/assets/rotating-coin.gif" width="20" height="20" />{{ selectedItem?.price * quantities[selectedItem.id]}}</p>
                <button @click="handleBuyItemfromShop()">Confirm Purchase</button>
                <button @click="closeModal">Cancel</button>
            </div>
        </div>
    </div>
</template>


<style scoped>
.shop-container {
    padding: 20px;
    text-align: center;
    min-width: 1200px;
    margin-right: 125px;
    margin-top: 120px;
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 650px;
    min-height: 650px;
    max-width: 1200px;
    background: transparent;
}

.shop-title {
    position: relative;
    color: #f5ff28;
    left: -460px;
    top: -20px;
    font-weight: bold;
    font-family: "Brush Script MT";
    font-size: 40px;
}

.item-list {
    justify-items: center;
    margin-left: 20px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: 250px;
    gap: 20px;
    width: 1100px;
}
.description{
    min-height: 40px;

}

.item {
    border: 2px solid black;
    padding: 8px;
    border-radius: 10px;
    width: 265px;
    text-align: center;
    background: #f9f9f9;
    position: relative;

}


.itemimg {
    width: 100px;
    height: 100px;
    object-fit: contain;
    border-radius: 8px;
    margin-bottom: 0px;
}

.item p {
    font-size: 14px;
    text-align: center;
    height: auto;
}
.coin-icon{
    position: relative;


}
 .item-list-buy-btn{
    position: absolute;
     display: flex;
     justify-content: center;  /* Center horizontally */
     align-items: center;
     bottom: 3px;                  /* Align the button to the bottom of the container */
     left: 50%;                  /* Horizontally center the button */
     transform: translateX(-50%); /* Offset the button by half of its width to perfectly center it */
     color: white;
     border: none;
     cursor: pointer;
     font-weight: bold;
     width: auto;
     letter-spacing: 2px;
     padding: 3px 14px;
     background: #d9534f;
     border-radius: 10px;
     text-align: center;


 }
 .item-list-buy-btn:hover{
     background: #ec817e;
 }

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    justify-content: center;
    background: linear-gradient(135deg, #fafafa, #f8b1b1);
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    padding: 2rem;
    width: 280px;
    text-align: center;
}

.modal-content button {
    margin-top: 15px;
    padding: 8px 15px;
    background: #d9534f;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.quantity-container {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin: 1rem 0;
}
.quantity-container input[type="number"]::-webkit-outer-spin-button,
.quantity-container input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* For Firefox */
.quantity-container input[type="number"] {
    -moz-appearance: textfield;
}
.quantity-container input {
    width: 60px;
    text-align-last: center;


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
.total-price{
    position: relative;
    display: flex;
    justify-content: center;  /* Center horizontally */
    align-items: center;
}

</style>
