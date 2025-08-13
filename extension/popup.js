// Popup script for VinScraper Chrome Extension

// DOM elements
let elements = {};
let currentTab = null;
let scrapingState = {
    isActive: false,
    progress: 0,
    vehiclesFound: 0
};
let preferences = {
    webAppUrl: 'http://localhost:5000',
    maxVehicles: 50,
    autoSync: false,
    showNotifications: true
};

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    initializeElements();
    await loadPreferences();
    await loadStatistics();
    await loadRecentVehicles();
    await checkCurrentTab();
    await updateConnectionStatus();
    setupEventListeners();
    startPeriodicUpdates();
});

// Initialize DOM element references
function initializeElements() {
    elements = {
        // Status
        connectionStatus: document.getElementById('connectionStatus'),
        statusIndicator: document.getElementById('statusIndicator'),
        statusText: document.getElementById('statusText'),
        
        // Current Site
        currentSite: document.getElementById('currentSite'),
        siteName: document.getElementById('siteName'),
        siteStatus: document.getElementById('siteStatus'),
        scrapeButton: document.getElementById('scrapeButton'),
        
        // Quick Scrape
        quickScrapeForm: document.getElementById('quickScrapeForm'),
        urlInput: document.getElementById('urlInput'),
        submitButton: document.getElementById('submitButton'),
        
        // Progress
        scrapingProgress: document.getElementById('scrapingProgress'),
        progressFill: document.getElementById('progressFill'),
        progressPercent: document.getElementById('progressPercent'),
        vehiclesFound: document.getElementById('vehiclesFound'),
        stopButton: document.getElementById('stopButton'),
        
        // Statistics
        totalVehicles: document.getElementById('totalVehicles'),
        sitesScraped: document.getElementById('sitesScraped'),
        successRate: document.getElementById('successRate'),
        
        // Vehicles
        vehiclesList: document.getElementById('vehiclesList'),
        
        // Footer
        syncButton: document.getElementById('syncButton'),
        settingsButton: document.getElementById('settingsButton'),
        openWebAppButton: document.getElementById('openWebAppButton'),
        
        // Settings
        settingsPanel: document.getElementById('settingsPanel'),
        closeSettings: document.getElementById('closeSettings'),
        webAppUrl: document.getElementById('webAppUrl'),
        maxVehicles: document.getElementById('maxVehicles'),
        autoSync: document.getElementById('autoSync'),
        showNotifications: document.getElementById('showNotifications'),
        saveSettings: document.getElementById('saveSettings'),
        
        // Loading
        loadingOverlay: document.getElementById('loadingOverlay'),
        loadingText: document.getElementById('loadingText'),
        
        // Toast
        toastContainer: document.getElementById('toastContainer')
    };
}

// Setup event listeners
function setupEventListeners() {
    // Current site scraping
    elements.scrapeButton.addEventListener('click', handleScrapeCurrentSite);
    
    // Quick scrape form
    elements.quickScrapeForm.addEventListener('submit', handleQuickScrape);
    
    // Progress controls
    elements.stopButton.addEventListener('click', handleStopScraping);
    
    // Footer buttons
    elements.syncButton.addEventListener('click', handleSync);
    elements.settingsButton.addEventListener('click', showSettings);
    elements.openWebAppButton.addEventListener('click', openWebApp);
    
    // Settings
    elements.closeSettings.addEventListener('click', hideSettings);
    elements.saveSettings.addEventListener('click', saveSettings);
    
    // Listen for background script messages
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.action) {
            case 'scrapingProgress':
                updateScrapingProgress(message.data);
                break;
            case 'vehiclesExtracted':
                handleVehiclesExtracted(message.data);
                break;
        }
    });
}

// Load user preferences
async function loadPreferences() {
    try {
        const result = await chrome.storage.sync.get(['preferences']);
        if (result.preferences) {
            preferences = { ...preferences, ...result.preferences };
        }
        
        // Update settings form
        elements.webAppUrl.value = preferences.webAppUrl;
        elements.maxVehicles.value = preferences.maxVehicles;
        elements.autoSync.checked = preferences.autoSync;
        elements.showNotifications.checked = preferences.showNotifications;
        
    } catch (error) {
        console.error('Failed to load preferences:', error);
    }
}

// Load statistics
async function loadStatistics() {
    try {
        const result = await chrome.storage.sync.get(['vehicles', 'scrapingHistory']);
        const vehicles = result.vehicles || [];
        const history = result.scrapingHistory || [];
        
        elements.totalVehicles.textContent = vehicles.length;
        
        // Count unique sites
        const sites = new Set(vehicles.map(v => v.sourceSite));
        elements.sitesScraped.textContent = sites.size;
        
        // Calculate success rate
        const totalScrapes = history.length;
        const successful = history.filter(h => h.status === 'success').length;
        const successRate = totalScrapes > 0 ? Math.round((successful / totalScrapes) * 100) : 0;
        elements.successRate.textContent = `${successRate}%`;
        
    } catch (error) {
        console.error('Failed to load statistics:', error);
    }
}

// Load recent vehicles
async function loadRecentVehicles() {
    try {
        const result = await chrome.storage.sync.get(['vehicles']);
        const vehicles = (result.vehicles || []).slice(-5).reverse(); // Last 5 vehicles
        
        if (vehicles.length === 0) {
            return; // Keep empty state
        }
        
        elements.vehiclesList.innerHTML = '';
        
        vehicles.forEach(vehicle => {
            const vehicleElement = createVehicleElement(vehicle);
            elements.vehiclesList.appendChild(vehicleElement);
        });
        
    } catch (error) {
        console.error('Failed to load recent vehicles:', error);
    }
}

// Create vehicle element for list
function createVehicleElement(vehicle) {
    const div = document.createElement('div');
    div.className = 'vehicle-item';
    
    div.innerHTML = `
        <div class="vehicle-info">
            <div class="vehicle-title">
                ${vehicle.year} ${vehicle.make} ${vehicle.model}
            </div>
            <div class="vehicle-details">
                <span class="price">$${vehicle.price}</span>
                <span class="mileage">${parseInt(vehicle.mileage).toLocaleString()} mi</span>
            </div>
            <div class="vehicle-source">${vehicle.sourceSite}</div>
        </div>
        <div class="vehicle-actions">
            <button class="action-button" onclick="viewVehicleDetails('${vehicle.vin}')">
                <i class="fas fa-eye"></i>
            </button>
            <button class="action-button" onclick="postToFacebook('${vehicle.vin}')">
                <i class="fab fa-facebook"></i>
            </button>
        </div>
    `;
    
    return div;
}

// Check current tab for supported sites
async function checkCurrentTab() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        currentTab = tab;
        
        if (!tab || !tab.url) {
            return;
        }
        
        const supportedSites = {
            'autotrader.com': 'AutoTrader',
            'cars.com': 'Cars.com',
            'cargurus.com': 'CarGurus',
            'dealer.com': 'Dealer.com',
            'carmax.com': 'CarMax'
        };
        
        const hostname = new URL(tab.url).hostname.toLowerCase();
        const siteMatch = Object.keys(supportedSites).find(site => hostname.includes(site));
        
        if (siteMatch) {
            elements.currentSite.style.display = 'block';
            elements.siteName.textContent = supportedSites[siteMatch];
            elements.siteStatus.textContent = 'Supported site detected';
            elements.scrapeButton.disabled = false;
            elements.scrapeButton.classList.add('enabled');
        } else {
            elements.currentSite.style.display = 'block';
            elements.siteName.textContent = hostname;
            elements.siteStatus.textContent = 'Site not supported';
            elements.scrapeButton.disabled = true;
            elements.scrapeButton.classList.remove('enabled');
        }
        
    } catch (error) {
        console.error('Failed to check current tab:', error);
    }
}

// Update connection status
async function updateConnectionStatus() {
    try {
        const response = await fetch(`${preferences.webAppUrl}/api/stats`);
        const isConnected = response.ok;
        
        elements.statusIndicator.className = `status-indicator ${isConnected ? 'online' : 'offline'}`;
        elements.statusText.textContent = isConnected ? 'Connected' : 'Offline';
        
        if (isConnected) {
            elements.connectionStatus.classList.add('connected');
        } else {
            elements.connectionStatus.classList.remove('connected');
        }
        
    } catch (error) {
        elements.statusIndicator.className = 'status-indicator offline';
        elements.statusText.textContent = 'Offline';
        elements.connectionStatus.classList.remove('connected');
    }
}

// Handle scraping current site
async function handleScrapeCurrentSite() {
    if (!currentTab) {
        showToast('Error: No active tab found', 'error');
        return;
    }
    
    showLoadingOverlay('Starting scraping...');
    
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'scrapeWebsite',
            data: {
                url: currentTab.url,
                sourceSite: 'Auto-detect',
                maxVehicles: preferences.maxVehicles
            }
        });
        
        if (response.success) {
            showScrapingProgress();
            showToast('Scraping started successfully', 'success');
        } else {
            showToast(`Scraping failed: ${response.error}`, 'error');
        }
        
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    } finally {
        hideLoadingOverlay();
    }
}

// Handle quick scrape form submission
async function handleQuickScrape(e) {
    e.preventDefault();
    
    const url = elements.urlInput.value.trim();
    if (!url) return;
    
    showLoadingOverlay('Starting scraping...');
    
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'scrapeWebsite',
            data: {
                url: url,
                sourceSite: 'Auto-detect',
                maxVehicles: preferences.maxVehicles
            }
        });
        
        if (response.success) {
            showScrapingProgress();
            elements.urlInput.value = '';
            showToast('Scraping started successfully', 'success');
        } else {
            showToast(`Scraping failed: ${response.error}`, 'error');
        }
        
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    } finally {
        hideLoadingOverlay();
    }
}

// Handle stop scraping
async function handleStopScraping() {
    try {
        await chrome.runtime.sendMessage({
            action: 'stopScraping'
        });
        
        hideScrapingProgress();
        showToast('Scraping stopped', 'info');
        
    } catch (error) {
        showToast(`Error stopping scraping: ${error.message}`, 'error');
    }
}

// Handle sync with web app
async function handleSync() {
    showLoadingOverlay('Syncing data...');
    
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'syncData'
        });
        
        if (response.success) {
            showToast(`Synced ${response.vehicleCount} vehicles and ${response.groupCount} groups`, 'success');
            await loadStatistics();
        } else {
            showToast(`Sync failed: ${response.error}`, 'error');
        }
        
    } catch (error) {
        showToast(`Sync error: ${error.message}`, 'error');
    } finally {
        hideLoadingOverlay();
    }
}

// Show/hide settings panel
function showSettings() {
    elements.settingsPanel.style.display = 'block';
}

function hideSettings() {
    elements.settingsPanel.style.display = 'none';
}

// Save settings
async function saveSettings() {
    try {
        preferences = {
            webAppUrl: elements.webAppUrl.value.trim(),
            maxVehicles: parseInt(elements.maxVehicles.value),
            autoSync: elements.autoSync.checked,
            showNotifications: elements.showNotifications.checked
        };
        
        await chrome.storage.sync.set({ preferences });
        
        hideSettings();
        showToast('Settings saved successfully', 'success');
        await updateConnectionStatus();
        
    } catch (error) {
        showToast(`Failed to save settings: ${error.message}`, 'error');
    }
}

// Open web application
function openWebApp() {
    chrome.tabs.create({ url: preferences.webAppUrl });
}

// Show/hide scraping progress
function showScrapingProgress() {
    elements.scrapingProgress.style.display = 'block';
    scrapingState.isActive = true;
}

function hideScrapingProgress() {
    elements.scrapingProgress.style.display = 'none';
    scrapingState.isActive = false;
    scrapingState.progress = 0;
    scrapingState.vehiclesFound = 0;
}

// Update scraping progress
function updateScrapingProgress(data) {
    if (!scrapingState.isActive) return;
    
    scrapingState.progress = data.progress || 0;
    scrapingState.vehiclesFound = data.vehiclesFound || 0;
    
    elements.progressFill.style.width = `${scrapingState.progress}%`;
    elements.progressPercent.textContent = `${scrapingState.progress}%`;
    elements.vehiclesFound.textContent = `${scrapingState.vehiclesFound} vehicles found`;
    
    if (data.completed) {
        setTimeout(() => {
            hideScrapingProgress();
            loadStatistics();
            loadRecentVehicles();
            
            if (scrapingState.vehiclesFound > 0) {
                showToast(`Scraping completed! Found ${scrapingState.vehiclesFound} vehicles`, 'success');
            } else {
                showToast('Scraping completed but no vehicles found', 'warning');
            }
        }, 2000);
    }
    
    if (data.error) {
        showToast(`Scraping error: ${data.error}`, 'error');
        hideScrapingProgress();
    }
}

// Handle vehicles extracted
function handleVehiclesExtracted(data) {
    if (preferences.showNotifications) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon48.png',
            title: 'VinScraper Pro',
            message: `Extracted ${data.count} new vehicles`
        });
    }
    
    // Refresh vehicle list
    loadRecentVehicles();
}

// Show loading overlay
function showLoadingOverlay(text) {
    elements.loadingText.textContent = text;
    elements.loadingOverlay.style.display = 'flex';
}

// Hide loading overlay
function hideLoadingOverlay() {
    elements.loadingOverlay.style.display = 'none';
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    }[type] || 'fas fa-info-circle';
    
    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
    
    // Remove on click
    toast.addEventListener('click', () => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    });
}

// Start periodic updates
function startPeriodicUpdates() {
    // Update connection status every 30 seconds
    setInterval(updateConnectionStatus, 30000);
    
    // Auto-sync if enabled
    if (preferences.autoSync) {
        setInterval(() => {
            handleSync().catch(() => {}); // Silent fail for auto-sync
        }, 5 * 60 * 1000); // Every 5 minutes
    }
}

// Global functions for vehicle actions
window.viewVehicleDetails = function(vin) {
    // Open web app with vehicle details
    chrome.tabs.create({ url: `${preferences.webAppUrl}/?vehicle=${vin}` });
};

window.postToFacebook = function(vin) {
    // Open Facebook posting flow
    showToast('Opening Facebook posting...', 'info');
    chrome.tabs.create({ url: 'https://www.facebook.com/marketplace/create' });
};
