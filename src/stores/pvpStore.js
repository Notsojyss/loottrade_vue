import { defineStore } from "pinia";
import axios from 'axios';
import { useAuthStore } from "@/stores/authStore";

export const usePvpStore = defineStore("pvp", {
    state: () => ({
        pvpbattles: [],
        pvphistory: [],
        mypvphistory: [],
        winMessage: "",
        showWinMessage: false,
        leaderboard: [],

    }),
    actions: {
        /**
         * Fetch the battles from pvp table with status waiting
         * @returns {Promise<void>}
         */
        async fetchPvpBattles() {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    console.error("No authentication token found");
                    return;
                }

                const apiUrl = import.meta.env.VITE_API_URL+ "/api/pvp/get-pvpbattles"; // Ensure it's an absolute URL
                const response = await axios.get(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });
                this.pvpbattles = response.data;

            } catch (error) {
                console.error("Error fetching PVP battles:", error);
                if (error.response) {
                    console.error("Response Status:", error.response.status);
                    console.error("Response Data:", error.response.data);
                }
            }

        },
        /**
         * Selecting the play of the opponent when they join a battle
         * @param play
         * @param pvpId
         * @returns {Promise<void>}
         */
        async selectPlay(play, pvpId) {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    console.error("No authentication token found");
                    return;
                }

                const apiUrl = `${import.meta.env.VITE_API_URL}/api/pvp/join-battle/${pvpId}`;
                const response = await axios.post(apiUrl,
                    {play: play},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    });
                if (response.data.message) {
                    this.winMessage = response.data.message;
                    this.showWinMessage = true;
                }


            } catch (error) {
                console.error("Error joining:", error);
            }
        },
        /**
         * Resets the winMessage
         */
        clearWinMessage() {
            this.winMessage = "";
            this.showWinMessage = false;

        },
        /**
         * Create/hosting battle
         * @param play
         * @param money_betted
         * @returns {Promise<void>}
         */
        async createBattle(play, money_betted) {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    console.error("No authentication token found");
                    return;
                }

                const apiUrl = import.meta.env.VITE_API_URL + "/api/pvp/assignPlay";
                const response = await axios.post(apiUrl,
                    {
                        play: play,
                        money_betted: money_betted
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    });
                this.fetchPvpBattles();
                alert(response.data.message);
                console.log(response.data.message);

            } catch (error) {
                console.error("Error creating battle:", error);
                if (error.response) {
                    console.error("Response Status:", error.response.status);
                    console.error("Response Data:", error.response.data);
                }
            }
        },
        /**
         * Gets the play of the host
         * @param pvpId
         * @returns {Promise<*|null>}
         */
        async fetchHostPlay(pvpId) {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    console.error("No authentication token found");
                    return null;
                }

                const apiUrl = `${import.meta.env.VITE_API_URL}/api/pvp/get-HostPlay/${pvpId}`;
                const response = await axios.get(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });

                return response.data;
            } catch (error) {
                console.error("Error fetching host play:", error);
                return null;
            }
        },

        /**
         * Fetch the PVP battles history of all users
         * @returns {Promise<void>}
         */
        async fetchPvpHistory() {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    console.error("No authentication token found");
                    return;
                }

                const apiUrl = import.meta.env.VITE_API_URL+ "/api/pvp/getPvpHistory"; // Ensure it's an absolute URL
                const response = await axios.get(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });
                this.pvphistory = response.data;

            } catch (error) {
                console.error("Error fetching PVP History:", error);
                if (error.response) {
                    console.error("Response Status:", error.response.status);
                    console.error("Response Data:", error.response.data);
                }
            }

        },
        /**
         * Fetch the PVP battles history of logged in user
         * @returns {Promise<void>}
         */
        async fetchMyPvpHistory() {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    console.error("No authentication token found");
                    return;
                }

                const apiUrl = import.meta.env.VITE_API_URL +"/api/pvp/getMyPvpHistory"; // Ensure it's an absolute URL
                const response = await axios.get(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });
                this.mypvphistory = response.data;

            } catch (error) {
                console.error("Error fetching your PVP History:", error);
                if (error.response) {
                    console.error("Response Status:", error.response.status);
                    console.error("Response Data:", error.response.data);
                }
            }

        },
        /**
         * get the Leaderboard standing with most wins
         * @returns {Promise<void>}
         */
        async fetchLeaderboard() {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    console.error("No authentication token found");
                    return;
                }

                const apiUrl = import.meta.env.VITE_API_URL + "/api/pvp/getLeaderboard";
                const response = await axios.get(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });
                this.leaderboard = response.data;
            } catch (error) {
                console.error("Error fetching leaderboard:", error);

                if (!error.response) {
                    console.error("Network error: Unable to reach the server.");
                    alert("Network error. Please check your internet connection.");
                    return;
                }

                const { status, data } = error.response;

                switch (status) {
                    case 404:
                        console.warn("Leaderboard not found.");
                        alert("Leaderboard data not found.");
                        break;
                    case 500:
                        console.error("Server error:", data);
                        alert("Something went wrong on the server. Please try again later.");
                        break;
                    default:
                        console.error("Unexpected error:", data);
                        alert(`Error: ${data.message || "An unexpected error occurred."}`);
                }
            }


        },

    }
});
