import axios from "axios";

const API_URL = "http://localhost:5000/api";

async function verify() {
    try {
        console.log("Checking health...");
        const health = await axios.get(`${API_URL}/health`);
        console.log("Health check:", health.data);

        // Note: This won't work easily without a token, but let's see if we get a 401 (which means the route exists)
        console.log("Checking /issues (Manager)...");
        try {
            await axios.get(`${API_URL}/issues`);
        } catch (err) {
            console.log("Issues check (Manager):", err.response?.status, err.response?.data?.message);
        }

        console.log("Checking /my-issues (Employee)...");
        try {
            await axios.get(`${API_URL}/my-issues`);
        } catch (err) {
            console.log("Issues check (Employee):", err.response?.status, err.response?.data?.message);
        }

    } catch (err) {
        console.error("Verification failed:", err.message);
    }
}

verify();
