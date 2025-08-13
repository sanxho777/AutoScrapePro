# VinScraper Pro Setup Guide

## Server Setup

### 1. Start the Development Server
The server is already configured and running. You can access the web application at:
- **Local URL**: http://localhost:5000
- **Replit URL**: https://[your-repl-name].replit.dev

### 2. Database Configuration
The application uses in-memory storage by default for development. No additional database setup is required.

## Chrome Extension Setup

### 1. Install the Extension
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `extension` folder from this project
5. The extension should now appear in your Chrome toolbar

### 2. Configure Extension
1. Click the VinScraper Pro icon in Chrome toolbar
2. Set the Web App URL to: `http://localhost:5000` (or your Replit URL)
3. Click "Connect to Web App" to establish connection

### 3. Grant Permissions
The extension needs the following permissions:
- **Storage**: To save scraped vehicle data
- **Active Tab**: To read content from dealership websites
- **Scripting**: To inject scraping scripts
- **Tabs**: To manage browser tabs during scraping

## How to Use

### Web Scraping Process

1. **Navigate to a Supported Site**
   - AutoTrader.com
   - Cars.com
   - CarGurus.com
   - Dealer.com
   - CarMax.com

2. **Start Scraping**
   - Click the "Scrape This Page" button in the web app
   - OR use the Chrome extension popup
   - The extension will automatically extract vehicle data

3. **View Results**
   - Scraped vehicles appear in the Dashboard
   - Data includes VIN, make, model, year, price, mileage, and images
   - All data is validated for accuracy

### Facebook Marketplace Integration

1. **Access Facebook Page**
   - Go to the Facebook section in the web app
   - Select vehicles to post to Facebook Marketplace

2. **Auto-Fill Forms**
   - The system will help auto-fill marketplace listing forms
   - Review and adjust details before posting

## Supported Websites

The extension works on these major automotive platforms:
- **AutoTrader**: Vehicle listings and dealer inventory
- **Cars.com**: Used car marketplace
- **CarGurus**: Car shopping platform
- **Dealer.com**: Individual dealership websites
- **CarMax**: Used car retailer

## Troubleshooting

### Extension Issues

**"Script already injected" Error**
- This has been fixed with injection guards
- Refresh the browser tab if you still see the error

**Extension Not Working**
1. Check that the extension is enabled in `chrome://extensions/`
2. Verify permissions are granted
3. Try reloading the extension

**Connection Issues**
1. Ensure the web server is running on port 5000
2. Check that the Web App URL is correctly set in extension popup
3. Try connecting from the extension popup

### Web App Issues

**TypeScript Errors**
- All TypeScript compilation errors have been resolved
- Run `npm run check` to verify no errors

**Data Not Syncing**
1. Verify extension is connected to web app
2. Check browser console for error messages
3. Ensure both extension and web app are using same URLs

## Development Notes

- The application uses TypeScript for type safety
- Chrome Extension Manifest V3 for modern browser compatibility
- React + Vite for fast development experience
- TailwindCSS for responsive styling
- In-memory storage for development (easily switchable to PostgreSQL)

## Security

- All scraped data is validated including VIN check digit verification
- No sensitive data is stored in browser storage
- Extension only accesses approved automotive websites
- All API communication uses standard HTTP protocols

## Next Steps

1. Load the Chrome extension using the instructions above
2. Start the web application (already running)
3. Test scraping on a supported automotive website
4. Review extracted vehicle data in the dashboard
5. Configure Facebook integration as needed

The system is now fully functional and ready for vehicle data scraping and Facebook Marketplace integration.