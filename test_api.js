import axios from "axios";

async function testApi() {
  try {
    console.log("Testing local API endpoint...");
    const response = await axios.get("http://localhost:3000/api/shul-times");
    console.log("✅ Success! Response:", JSON.stringify(response.data).substring(0, 200));
  } catch (error) {
    console.log("❌ Error:", error.message);
    if (error.response) {
      console.log("Status:", error.response.status);
    }
  }
}

testApi();
