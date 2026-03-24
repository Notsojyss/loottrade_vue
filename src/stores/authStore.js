import { defineStore } from "pinia";
import { ref } from "vue";
import axios from 'axios'
import { useToast } from "vue-toastification";
export const useAuthStore = defineStore("auth", {
    state: () => ({
         // user: JSON.parse(localStorage.getItem("user")) || null,
        user:null,
        money: 0,
        items: [],
        userItemsForSale: [],
        listings: [],
        groupedListings: [],
        itemhistory: [],
    }),
    watch: {
        /**
         * Keeps Money Update
         * @param newVal
         */
        money(newVal) {
            console.log('Money updated:', newVal);
        }
    },
    actions: {
        async fetchUser() {
            try {
                const token = localStorage.getItem("auth_token");
                const response = await fetch(import.meta.env.VITE_API_URL + "/api/user/fetch", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }});
                this.user = await response.json();
                console.log(this.user);
            } catch (error) {
                console.error("Failed to fetch user:", error);
                this.user = null;
            }
        },
        /**
         *  user's info and token  for API requests
         * @param userData
         * @param token
         */
        login(userData, token) {
            this.user = userData;
            localStorage.setItem("auth_token", token);
        },
        updateMoney(newAmount) {
            this.money = newAmount;
        },
        /**
         *Deletes the token of the user when logging out
         * @param router
         * @returns {Promise<void>}
         */
        async logout(router) {
            const toast = useToast();

            const token = localStorage.getItem("auth_token");

            if (!token) {
                toast.warning("No active session found.");
                return;
            }
            try {
                const response = await fetch(
                    import.meta.env.VITE_API_URL + "/api/user/logout",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        }
                    }
                );
                if (!response.ok) {
                    throw new Error("Logout failed");
                }
                this.user = null;
                localStorage.removeItem("auth_token");
                localStorage.removeItem("user");
                toast.success("Logged out successfully!");
                router.push("/loginform");
            } catch (error) {
                console.error("Logout error:", error);
                toast.error("Error logging out. Please try again.");
            }
        }
        ,
        /**
         *Gets the value of Money
         * @returns {Promise<void>}
         */
        async fetchMoney() {
            try {
                const token = localStorage.getItem("auth_token");
                const response = await axios.get(import.meta.env.VITE_API_URL + "/api/user/getMoney", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                 this.money = response.data.money;
                 console.log("Updated Money", this.money);
            } catch (error) {
                console.error("Error fetching money:", error.response?.data || error.message);
            }
        },
        /**
         * Fetch the items of the logged in User
         * @returns {Promise<void>}
         */
        async fetchUserItems() {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    console.error("No authentication token found.");
                    return;
                }

                const response = await axios.get(import.meta.env.VITE_API_URL + "/api/user/getUsersitem", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                this.items = response.data.map(useritemdata => ({
                    ...useritemdata.item,
                    quantity: useritemdata.quantity
                }));
            } catch (error) {
                console.error("Error fetching user items:", error);
            }
        },
        /**
         * Fetch the items the logged-in user is selling
         * @returns {Promise<void>}
         */
        async fetchUserItemsForSale() {
            try {
                const token = localStorage.getItem("auth_token");

                if (!token) {
                    console.error("No authentication token found.");
                    return;
                }

                const response = await axios.get(
                    import.meta.env.VITE_API_URL + "/api/market/get-useritemforsale",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );

                this.userItemsForSale = response.data.filter(item => item.status === "active");

            } catch (error) {
                console.error("Error fetching user items for sale:", error);
            }
        },
        /**
         * Selling the item this puts the item in market listing table
         * @param itemId
         * @param quantity
         * @param price
         * @returns {Promise<void>}
         */
        async sellItem(itemId, quantity, price) {
            try {
                const token = localStorage.getItem("auth_token");

                if (!token) {
                    console.error("No authentication token found.");
                    return;
                }

                const response = await axios.post(
                    import.meta.env.VITE_API_URL + "/api/market/sellitem",
                    {
                        item_id: itemId,
                        quantity: quantity,
                        price: price,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                alert(response.data.message);
                await this.fetchUserItems();
                await this.fetchUserItemsForSale();
            } catch (error) {
                console.error("Error selling item:", error.response?.data || error.message);
                alert(error.response?.data?.message || "Failed to sell item.");
            }
        },
        /**
         * This remove the item in market listing table
         * @param listingId
         * @returns {Promise<void>}
         */
        async cancelListing(listingId) {
            try {
                const confirmCancel = confirm("Are you sure you want to cancel?");
                if (!confirmCancel) return;
                const token = localStorage.getItem("auth_token");

                if (!token) {
                    console.error("No authentication token found.");
                    return;
                }

                const response = await axios.post(
                    import.meta.env.VITE_API_URL + "/api/market/cancelsellitem",
                    {
                        listing_id: listingId,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                alert(response.data.message);
                console.log("Successfully Cancelled Selling an Item")
                await this.fetchUserItems();
                await this.fetchListings();
                await this.fetchUserItemsForSale();
            } catch (error) {
                console.error("Error canceling listing:", error.response?.data || error.message);
                alert(error.response?.data?.message || "Failed to cancel listing.");
            }
        },
        /**
         * Fetch the items with active status in Market_listings table
         * @returns {Promise<void>}
         */
        async fetchListings() {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    console.error("No authentication token found");
                    return;
                }

                const response = await axios.get(import.meta.env.VITE_API_URL + "/api/market/get-activelisting", {
                    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
                });

                this.listings = response.data;
                this.groupListings();
            } catch (error) {
                console.error("Error fetching listings:", error);
            }
        },
        /**
         * Groups the items from listing
         */
        groupListings() {
            const uniqueItems = {};
            this.listings.forEach(listing => {
                if (!uniqueItems[listing.item_name]) {
                    uniqueItems[listing.item_name] = {
                        id: listing.id,
                        item_id: listing.item_id,
                        item_name: listing.item_name,
                        description: listing.description,
                        rarity: listing.rarity,
                        image: listing.image
                    };
                }
            });
            this.groupedListings = Object.values(uniqueItems);
        },
        /**
         * Buying the item from either the Market or the official Shop
         * @param id
         * @param quantity
         * @param fromMarket
         * @param idType
         * @returns {Promise<void>}
         */
        async buyItem({ id, quantity, fromMarket = true, idType = "listing_id" }) {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    console.error("No authentication token found");
                    return;
                }
                const requestData = {
                    [idType]: id,
                    quantity,
                    from_market: fromMarket,
                };
                const response = await axios.post(
                    import.meta.env.VITE_API_URL + "/api/buy-item",
                    requestData,
                    { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
                );
                this.fetchListings();
                alert(response.data.message);
            } catch (error) {
                if (error.response.status === 400) {
                    alert(error.response.data.error); // Show "Not enough money"
                }else if (error.response.status === 401) {
                    alert("Unauthorized. Please log in.");
                } else if (error.response.status === 404) {
                    alert("Item or listing not found.");
                } else {
                    alert("An unexpected error occurred. Please try again.");
                }
                console.error("Error purchasing item:", error.response?.data || error.message);
            }
        },
        /**
         * Fetch the History of item
         * @param itemId
         * @returns {Promise<void>}
         */
        async fetchItemHistory(itemId) {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    console.error("No authentication token found");
                    return;
                }

                const response = await axios.get(import.meta.env.VITE_API_URL + "/api/market/get-itemhistory", {
                    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                    params: { item_id: itemId }
                });


                this.itemhistory = response.data; // Store fetched history


            } catch (error) {
                console.error("Error fetching item history:", error.response?.data || error.message);
            }
        },
    }
});
