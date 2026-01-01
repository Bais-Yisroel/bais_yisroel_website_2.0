import dotenv from "dotenv";
dotenv.config();

import express from "express";
import axios from "axios";
import cors from "cors";

import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";


const app = express();

app.set("trust proxy", true);

app.use(cors({ origin: "https://david654100.github.io" }));
app.use(express.json());

const CSV_PATH = path.join(process.cwd(), "data", "bais_zman_draft_2.csv");

function isAdminIP(req) {
  const adminIps = (process.env.ADMIN_IPS || "")
    .split(",")
    .map(ip => ip.trim());

  const requestIp =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress;

  console.log("Request IP:", requestIp);

  return adminIps.includes(requestIp);
}

// server.js
app.get("/check-admin", (req, res) => {
  if (isAdminIP(req)) {
    res.json({ allowed: true });
  } else {
    res.json({ allowed: false });
  }
});

app.post("/api/zmanim/override-mincha", (req, res) => {
  if (!isAdminIP(req)) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const { date, time } = req.body;
  if (!date || !time) {
    return res.status(400).json({ error: "Missing date or time" });
  }

  const csvRaw = fs.readFileSync(CSV_PATH, "utf8");
  const rows = parse(csvRaw, { columns: true });

  const row = rows.find(r => r.engDateString === date);
  if (!row) {
    return res.status(404).json({ error: "Date not found in CSV" });
  }

  row.zmanim_mincha = time;

  const updatedCsv = stringify(rows, { header: true });
  fs.writeFileSync(CSV_PATH, updatedCsv);

  res.json({ success: true });
});

app.get("/", (req, res) => {
  res.send("✅ SharePoint file API is alive");
});

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const tokenUrl = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`;

  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", process.env.CLIENT_ID);
  params.append("client_secret", process.env.CLIENT_SECRET);
  params.append("scope", "https://graph.microsoft.com/.default");

  const response = await axios.post(tokenUrl, params.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  cachedToken = response.data.access_token;
  tokenExpiresAt = now + (response.data.expires_in - 60) * 1000;

  return cachedToken;
}


async function getMostRecentFile(folderPath, accessToken) {
  let files = [];
  let url = `https://graph.microsoft.com/v1.0/drives/${process.env.SHAREPOINT_DRIVE_ID}/root:/${encodeURIComponent(folderPath)}:/children`;

  while (url) {
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    files.push(...res.data.value);
    url = res.data["@odata.nextLink"];
  }

  const onlyFiles = files.filter(item => item.file);

  console.log(`📄 Fetching from: ${folderPath}`);
  console.log("📄 Fetched files:");

  onlyFiles.forEach(file => {
    console.log(`- ${file.name} | Modified: ${file.lastModifiedDateTime}`);
  });

  if (onlyFiles.length === 0) {
    throw new Error("No files found in the folder.");
  }

  onlyFiles.sort((a, b) => new Date(b.lastModifiedDateTime) - new Date(a.lastModifiedDateTime));
  return onlyFiles[0];
}


app.get("/api/token-test", async (req, res) => {
  try {
    const token = await getAccessToken();
    res.json({ message: "Access token retrieved successfully ✅", token });
  } catch (err) {
    console.error("❌ Token error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

app.get("/api/sharepoint/recent-file", async (req, res) => {
  try {
    const folder = req.query.folder;
    if (!folder) return res.status(400).json({ error: "Missing folder query parameter" });

    const accessToken = await getAccessToken();

    const folderPath = `BY Observer/BYSO Files/${folder.replace(/_/g, " ")}`;
    
    const latestFile = await getMostRecentFile(folderPath, accessToken);

    const fileResponse = await axios.get(latestFile["@microsoft.graph.downloadUrl"], {
      responseType: "arraybuffer"
    });

    res.set({
      "Cache-Control": "no-store",
      "Content-Type": fileResponse.headers["content-type"] || "application/pdf",
      "Content-Disposition": `inline; filename="${latestFile.name}"`
    });

    res.send(fileResponse.data);
  } catch (err) {
    console.error("❌ Error fetching file:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* START SERVER */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server listening on ${PORT}`);
});