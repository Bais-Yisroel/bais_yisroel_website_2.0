import express from "express";
import axios from "axios";

const app = express();

// Simple shul-times endpoint
app.get("/api/shul-times", async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const shulTimesApiUrl = `https://us-central1-bais-website.cloudfunctions.net/bais_shul_times?date=${date}`;

    const response = await axios.get(shulTimesApiUrl, {
      headers: {
        "Accept": "application/json"
      }
    });

    res.json(response.data);
  } catch (err) {
    console.error("❌ Shul times API error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
