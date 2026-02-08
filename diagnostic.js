// Diagnostic tool to test API endpoints
// Run this locally: node diagnostic.js

import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const SHUL_TIMES_URL = "https://us-central1-bais-website.cloudfunctions.net/bais_shul_times";

async function testShulTimesAPI() {
  console.log("🕐 Testing Shul Times API...\n");
  
  const testDates = [
    new Date().toISOString().split('T')[0], // today
    "2028-01-02", // the date you mentioned
  ];

  for (const date of testDates) {
    try {
      console.log(`  Testing date: ${date}`);
      const response = await axios.get(`${SHUL_TIMES_URL}?date=${date}`, {
        headers: { "Accept": "application/json" },
        timeout: 10000
      });
      console.log(`  ✅ Status: ${response.status}`);
      console.log(`  📄 Data preview: ${JSON.stringify(response.data).substring(0, 200)}...\n`);
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
      if (err.response) {
        console.log(`     Status: ${err.response.status}`);
        console.log(`     Data: ${JSON.stringify(err.response.data).substring(0, 200)}`);
      }
      console.log("");
    }
  }
}

async function testSharePointConnection() {
  console.log("🖼️ Testing SharePoint Connection...\n");
  
  const requiredEnvVars = ['TENANT_ID', 'CLIENT_ID', 'CLIENT_SECRET', 'SHAREPOINT_DRIVE_ID'];
  
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    console.log(`  ${envVar}: ${value ? '✅ Set' : '❌ MISSING'}`);
  }
  
  if (!process.env.TENANT_ID || !process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.SHAREPOINT_DRIVE_ID) {
    console.log("\n  ⚠️  Missing required environment variables for SharePoint!");
    return;
  }

  try {
    const tokenUrl = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`;
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", process.env.CLIENT_ID);
    params.append("client_secret", process.env.CLIENT_SECRET);
    params.append("scope", "https://graph.microsoft.com/.default");

    console.log("\n  🔐 Requesting access token...");
    const tokenResponse = await axios.post(tokenUrl, params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 10000
    });
    console.log("  ✅ Token received successfully");

    const accessToken = tokenResponse.data.access_token;
    const driveId = process.env.SHAREPOINT_DRIVE_ID;

    // Test Pictures folder - show ALL items (not just images)
    const picturesPath = "BY Observer/BYSO Files/Pictures";
    console.log(`\n  📁 Fetching ALL items from: ${picturesPath}`);
    
    const url = `https://graph.microsoft.com/v1.0/drives/${driveId}/root:/${encodeURIComponent(picturesPath)}:/children`;
    
    const filesResponse = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 10000
    });
    
    console.log(`  ✅ Found ${filesResponse.data.value.length} items in Pictures folder`);
    
    if (filesResponse.data.value.length === 0) {
      console.log("     ⚠️  Folder is empty!");
    } else {
      console.log("     All items:");
      filesResponse.data.value.forEach(item => {
        const type = item.folder ? 'FOLDER' : 'FILE';
        console.log(`     - [${type}] ${item.name}`);
      });
    }

    // Also list subfolders if they exist
    const subfolders = filesResponse.data.value.filter(item => item.folder);
    if (subfolders.length > 0) {
      console.log("\n     Exploring subfolders:");
      for (const subfolder of subfolders) {
        const subUrl = `https://graph.microsoft.com/v1.0/drives/${driveId}/root:/${encodeURIComponent(picturesPath)}/${encodeURIComponent(subfolder.name)}:/children`;
        const subResponse = await axios.get(subUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 10000
        });
        console.log(`\n     📂 ${subfolder.name}/ (${subResponse.data.value.length} items):`);
        subResponse.data.value.slice(0, 10).forEach(item => {
          console.log(`       - [${item.file ? 'FILE' : 'FOLDER'}] ${item.name}`);
        });
      }
    }

  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`);
    if (err.response) {
      console.log(`     Status: ${err.response.status}`);
      console.log(`     Data: ${JSON.stringify(err.response.data).substring(0, 500)}`);
    }
  }
}

async function main() {
  console.log("=".repeat(50));
  console.log("  Bais Yisroel Website - API Diagnostic Tool");
  console.log("=".repeat(50));
  console.log("");

  await testShulTimesAPI();
  await testSharePointConnection();
  
  console.log("=".repeat(50));
  console.log("  Diagnostic complete!");
  console.log("=".repeat(50));
}

main().catch(console.error);

