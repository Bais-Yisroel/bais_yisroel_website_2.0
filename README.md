# Congregation Bais Yisroel Website

A full-stack website for Congregation Bais Yisroel, now hosted on Render with both frontend and backend.

## Features

- **Frontend**: Static HTML/CSS/JS pages with responsive design
- **Backend**: Express.js server with SharePoint integration
- **Shul Times**: Proxy API to Google Cloud Function (avoids CORS issues)
- **PDF Downloads**: SharePoint file downloads via backend API
- **Image Carousel**: Dynamic images from SharePoint

## Deployment to Render

### 1. Environment Variables

Set these in Render Dashboard > Your Service > Environment:

```env
# SharePoint API Configuration
TENANT_ID=your-tenant-id
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
SHAREPOINT_DRIVE_ID=your-sharepoint-drive-id

# Admin IPs for override functionality (comma-separated)
ADMIN_IPS=127.0.0.1,::1

# Node environment
NODE_ENV=production
```

### 2. Render Service Settings

- **Build Command**: (leave empty)
- **Start Command**: `node server.js`
- **Root Directory**: (leave empty or set to project root)

### 3. Deploy

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Configure the settings above
4. Add environment variables
5. Deploy

### 4. After Deployment

Add your production URL to the `allowedOrigins` array in `server.js`:

```javascript
const allowedOrigins = [
  "http://localhost:3000",
  "https://bais-yisroel-website-2-0.onrender.com",
  "https://your-prod-url.onrender.com",  // Add this
];
```

Then redeploy.

## Local Development

1. Copy `.env.example` to `.env` and fill in values
2. Install dependencies: `npm install`
3. Start server: `npm start`
4. Visit `http://localhost:3000`

## Project Structure

```
├── server.js           # Express backend with all API routes
├── package.json        # Node dependencies
├── .env.example        # Environment variables template
├── .gitignore
├── index.html          # Homepage
├── community.html      # Community page
├── dvar.html           # Dvar Torahs page
├── halachos.html       # Halachos page
├── information.html    # Information forms page
├── subscribe.html      # Newsletter subscription
├── script.js           # Frontend JavaScript
├── navbar.js           # Navigation functionality
├── carousel.js         # Image carousel
├── styles.css          # Main styles
├── mobile.css          # Mobile responsive styles
├── images/             # Static images
└── data/               # CSV data files
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Serves the homepage |
| `GET /api/shul-times` | Proxy to shul times API |
| `GET /api/sharepoint/recent-file?folder=X` | Download recent file from SharePoint folder |
| `GET /api/sharepoint/pictures` | Get list of images from SharePoint |
| `POST /api/zmanim/override-mincha` | Override mincha time (admin only) |
| `GET /check-admin` | Check if IP is admin |

## Tech Stack

- **Backend**: Express.js, Axios, CORS, Dotenv
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Integration**: Microsoft Graph API (SharePoint)
- **Hosting**: Render

