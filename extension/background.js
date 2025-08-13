// Background service worker for VinScraper Chrome Extension

// Extension state
let isConnected = false;
let webAppUrl = null;
let scrapingState = {
  isActive: false,
  currentUrl: null,
  vehiclesFound: 0,
  progress: 0
};

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('VinScraper extension installed');
  
  // Set default preferences
  chrome.storage.sync.set({
    preferences: {
      autoPost: false,
      maxGroupsPerPost: 3,
      postDelay: 2000,
      webAppUrl: 'http://localhost:5000'
    }
  });
});

// Handle messages from content scripts and web app
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'scrapeWebsite':
      handleScrapeWebsite(message.data, sendResponse);
      return true; // Keep message channel open for async response
      
    case 'getScrapingState':
      sendResponse(scrapingState);
      break;
      
    case 'vehicleDataExtracted':
      handleVehicleDataExtracted(message.data, sender);
      break;
      
    case 'scrapingProgress':
      handleScrapingProgress(message.data);
      break;
      
    case 'connectToWebApp':
      connectToWebApp(message.data.url);
      sendResponse({ success: true, connected: isConnected });
      break;
      
    case 'syncData':
      handleSyncData(sendResponse);
      return true;
      
    default:
      console.warn('Unknown action:', message.action);
  }
});

// Handle tab updates for automatic detection
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const supportedSites = [
      'autotrader.com',
      'cars.com',
      'cargurus.com',
      'dealer.com',
      'carmax.com'
    ];
    
    const isSupported = supportedSites.some(site => tab.url.includes(site));
    
    if (isSupported) {
      // Inject content script if not already injected
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      }).catch(err => {
        // Script might already be injected
        console.log('Script injection skipped:', err.message);
      });
      
      // Update badge to show extension is active
      chrome.action.setBadgeText({
        text: '●',
        tabId: tabId
      });
      chrome.action.setBadgeBackgroundColor({
        color: '#059669'
      });
    }
  }
});

// Handle scraping website request
async function handleScrapeWebsite(data, sendResponse) {
  try {
    scrapingState = {
      isActive: true,
      currentUrl: data.url,
      vehiclesFound: 0,
      progress: 0
    };
    
    // Find or create tab with the URL
    const tabs = await chrome.tabs.query({ url: data.url });
    let tabId;
    
    if (tabs.length > 0) {
      tabId = tabs[0].id;
      await chrome.tabs.update(tabId, { active: true });
    } else {
      const newTab = await chrome.tabs.create({ url: data.url, active: false });
      tabId = newTab.id;
    }
    
    // Wait for tab to load then inject content script
    await waitForTabLoad(tabId);
    
    // Inject and execute scraping script
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });
    
    // Start scraping
    await chrome.tabs.sendMessage(tabId, {
      action: 'startScraping',
      data: {
        sourceSite: data.sourceSite,
        maxVehicles: data.maxVehicles || 50
      }
    });
    
    sendResponse({
      success: true,
      message: 'Scraping started successfully',
      tabId: tabId
    });
    
  } catch (error) {
    console.error('Scraping failed:', error);
    scrapingState.isActive = false;
    
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

// Wait for tab to complete loading
function waitForTabLoad(tabId) {
  return new Promise((resolve) => {
    const listener = (updatedTabId, changeInfo, tab) => {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });
}

// Handle extracted vehicle data
async function handleVehicleDataExtracted(vehicles, sender) {
  try {
    // Save to Chrome storage
    await saveVehiclesToStorage(vehicles);
    
    // Update scraping state
    scrapingState.vehiclesFound += vehicles.length;
    
    // Sync with web app if connected
    if (isConnected && webAppUrl) {
      await syncVehiclesWithWebApp(vehicles);
    }
    
    // Notify popup if open
    notifyPopup('vehiclesExtracted', {
      count: vehicles.length,
      total: scrapingState.vehiclesFound
    });
    
    console.log(`Extracted ${vehicles.length} vehicles, total: ${scrapingState.vehiclesFound}`);
    
  } catch (error) {
    console.error('Failed to handle extracted vehicle data:', error);
  }
}

// Handle scraping progress updates
function handleScrapingProgress(data) {
  scrapingState.progress = data.progress;
  
  if (data.completed) {
    scrapingState.isActive = false;
  }
  
  // Notify popup
  notifyPopup('scrapingProgress', scrapingState);
}

// Save vehicles to Chrome storage
async function saveVehiclesToStorage(vehicles) {
  try {
    const result = await chrome.storage.sync.get(['vehicles']);
    const existingVehicles = result.vehicles || [];
    
    // Check for duplicates by VIN
    const newVehicles = vehicles.filter(vehicle => 
      !existingVehicles.some(existing => existing.vin === vehicle.vin)
    );
    
    if (newVehicles.length > 0) {
      const updatedVehicles = [...existingVehicles, ...newVehicles];
      await chrome.storage.sync.set({ vehicles: updatedVehicles });
    }
    
    return newVehicles.length;
  } catch (error) {
    console.error('Failed to save vehicles to storage:', error);
    throw error;
  }
}

// Connect to web application
async function connectToWebApp(url) {
  try {
    webAppUrl = url;
    
    // Test connection
    const response = await fetch(`${url}/api/stats`);
    isConnected = response.ok;
    
    if (isConnected) {
      console.log('Connected to web app:', url);
      
      // Update preferences
      await chrome.storage.sync.set({
        preferences: {
          ...await getPreferences(),
          webAppUrl: url
        }
      });
    }
    
  } catch (error) {
    console.error('Failed to connect to web app:', error);
    isConnected = false;
  }
}

// Sync vehicles with web app
async function syncVehiclesWithWebApp(vehicles) {
  if (!isConnected || !webAppUrl) return;
  
  try {
    for (const vehicle of vehicles) {
      const response = await fetch(`${webAppUrl}/api/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vehicle)
      });
      
      if (!response.ok) {
        console.error('Failed to sync vehicle:', vehicle.vin);
      }
    }
  } catch (error) {
    console.error('Sync with web app failed:', error);
  }
}

// Handle data synchronization
async function handleSyncData(sendResponse) {
  try {
    const data = await chrome.storage.sync.get(['vehicles', 'facebookGroups']);
    const preferences = await getPreferences();
    
    if (isConnected && webAppUrl) {
      await syncVehiclesWithWebApp(data.vehicles || []);
      
      // Sync Facebook groups
      if (data.facebookGroups) {
        for (const group of data.facebookGroups) {
          try {
            await fetch(`${webAppUrl}/api/facebook-groups`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(group)
            });
          } catch (error) {
            console.error('Failed to sync Facebook group:', error);
          }
        }
      }
    }
    
    sendResponse({
      success: true,
      synced: isConnected,
      vehicleCount: (data.vehicles || []).length,
      groupCount: (data.facebookGroups || []).length
    });
    
  } catch (error) {
    console.error('Data sync failed:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

// Get preferences from storage
async function getPreferences() {
  try {
    const result = await chrome.storage.sync.get(['preferences']);
    return result.preferences || {
      autoPost: false,
      maxGroupsPerPost: 3,
      postDelay: 2000,
      webAppUrl: 'http://localhost:5000'
    };
  } catch (error) {
    console.error('Failed to get preferences:', error);
    return {};
  }
}

// Notify popup of updates
function notifyPopup(action, data) {
  try {
    chrome.runtime.sendMessage({ action, data }).catch(() => {
      // Popup might not be open
    });
  } catch (error) {
    // Ignore errors if popup is not open
  }
}

// Clean up on startup
chrome.runtime.onStartup.addListener(() => {
  scrapingState = {
    isActive: false,
    currentUrl: null,
    vehiclesFound: 0,
    progress: 0
  };
});

// Handle extension icon click
chrome.action.onClicked.addListener(() => {
  // This will open the popup automatically due to manifest configuration
});

// Periodic data cleanup (remove old entries)
setInterval(async () => {
  try {
    const result = await chrome.storage.sync.get(['vehicles']);
    const vehicles = result.vehicles || [];
    
    // Remove vehicles older than 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const filteredVehicles = vehicles.filter(vehicle => {
      const scrapedAt = new Date(vehicle.scrapedAt || 0).getTime();
      return scrapedAt > thirtyDaysAgo;
    });
    
    if (filteredVehicles.length !== vehicles.length) {
      await chrome.storage.sync.set({ vehicles: filteredVehicles });
      console.log(`Cleaned up ${vehicles.length - filteredVehicles.length} old vehicle records`);
    }
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}, 24 * 60 * 60 * 1000); // Run once per day
