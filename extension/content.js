// Content script for scraping vehicle data from dealership websites

// Scraping state
let isScrapingActive = false;
let scrapedVehicles = [];
let currentSite = '';
let maxVehicles = 50;

// Site-specific selectors and patterns
const siteConfigs = {
  autotrader: {
    vehicleCards: '[data-cmp="inventoryListing"], .listing-container, .atc-listing-card',
    title: '[data-cmp="vehicleTitle"], .listing-title, .atc-listing-title',
    price: '[data-cmp="price"], .pricing-container .first-price, .vehicle-price',
    mileage: '[data-cmp="mileage"], .listing-mileage, .atc-listing-mileage',
    vin: '[data-vin], .vin-number',
    images: '[data-cmp="vehicleImage"] img, .listing-image img, .vehicle-image img',
    dealer: '.dealer-name, .listing-dealer-name',
    location: '.dealer-location, .listing-location',
    features: '.vehicle-features li, .features-list li',
    transmission: '.transmission, .listing-transmission',
    fuelType: '.fuel-type, .listing-fuel-type',
    exteriorColor: '.exterior-color, .listing-exterior-color',
    description: '.vehicle-description, .listing-description'
  },
  
  cars: {
    vehicleCards: '.shop-srp-listings__listing-container, .listing-row, .vehicle-card',
    title: '.listing-row__title, .vehicle-title',
    price: '.primary-price, .listing-price',
    mileage: '.listing-row__mileage, .vehicle-mileage',
    vin: '[data-vin], .vin-display',
    images: '.listing-row__image img, .vehicle-image img',
    dealer: '.dealer-name, .listing-dealer',
    location: '.dealer-location',
    features: '.vehicle-features li, .features li',
    transmission: '.transmission-type',
    fuelType: '.fuel-type',
    exteriorColor: '.exterior-color',
    description: '.vehicle-description'
  },
  
  cargurus: {
    vehicleCards: '[data-testid="listing-card"], .cg-dealFinder-result, .vehicle-listing',
    title: '[data-testid="listing-title"], .cg-dealFinder-result-title',
    price: '[data-testid="price"], .cg-dealFinder-result-price',
    mileage: '[data-testid="mileage"], .cg-dealFinder-result-mileage',
    vin: '[data-vin], .vin-number',
    images: '[data-testid="listing-image"] img, .cg-dealFinder-result-image img',
    dealer: '.dealer-name, .cg-dealFinder-result-dealer',
    location: '.dealer-location',
    features: '.vehicle-features li',
    transmission: '.transmission',
    fuelType: '.fuel-type',
    exteriorColor: '.color-exterior',
    description: '.vehicle-description'
  },
  
  dealer: {
    vehicleCards: '.vehicle-card, .inventory-listing, .vdp-container',
    title: '.vehicle-title, .vdp-title',
    price: '.vehicle-price, .price-container .price',
    mileage: '.vehicle-mileage, .mileage-display',
    vin: '.vin-number, [data-vin]',
    images: '.vehicle-images img, .gallery-image img',
    dealer: '.dealer-info .name',
    location: '.dealer-info .address',
    features: '.features-list li, .equipment-list li',
    transmission: '.transmission-info',
    fuelType: '.fuel-info',
    exteriorColor: '.color-info .exterior',
    description: '.vehicle-description, .comments'
  },
  
  carmax: {
    vehicleCards: '.car-tile, .vehicle-tile',
    title: '.car-tile__title, .vehicle-title',
    price: '.car-tile__price, .vehicle-price',
    mileage: '.car-tile__mileage, .vehicle-mileage',
    vin: '.vin-display, [data-vin]',
    images: '.car-tile__image img, .vehicle-image img',
    dealer: '.store-name',
    location: '.store-location',
    features: '.features-list li',
    transmission: '.transmission',
    fuelType: '.fuel-type',
    exteriorColor: '.exterior-color',
    description: '.vehicle-description'
  }
};

// VIN validation regex
const VIN_REGEX = /[A-HJ-NPR-Z0-9]{17}/g;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'startScraping':
      startScraping(message.data);
      sendResponse({ success: true });
      break;
      
    case 'stopScraping':
      stopScraping();
      sendResponse({ success: true });
      break;
      
    case 'getScrapingStatus':
      sendResponse({
        isActive: isScrapingActive,
        vehiclesFound: scrapedVehicles.length,
        currentSite: currentSite
      });
      break;
      
    default:
      console.warn('Unknown action in content script:', message.action);
  }
});

// Start scraping process
async function startScraping(options = {}) {
  if (isScrapingActive) {
    console.log('Scraping already active');
    return;
  }
  
  isScrapingActive = true;
  scrapedVehicles = [];
  currentSite = detectWebsite();
  maxVehicles = options.maxVehicles || 50;
  
  console.log(`Starting scraping on ${currentSite}`);
  
  try {
    // Send progress update
    sendProgressUpdate(0, false);
    
    // Wait for page to be fully loaded
    await waitForPageLoad();
    
    // Scrape vehicles based on site type
    await scrapeVehicles();
    
    // Send final results
    if (scrapedVehicles.length > 0) {
      await chrome.runtime.sendMessage({
        action: 'vehicleDataExtracted',
        data: scrapedVehicles
      });
    }
    
    sendProgressUpdate(100, true);
    console.log(`Scraping completed. Found ${scrapedVehicles.length} vehicles.`);
    
  } catch (error) {
    console.error('Scraping failed:', error);
    sendProgressUpdate(0, true, error.message);
  } finally {
    isScrapingActive = false;
  }
}

// Stop scraping process
function stopScraping() {
  isScrapingActive = false;
  console.log('Scraping stopped by user');
}

// Detect which website we're on
function detectWebsite() {
  const hostname = window.location.hostname.toLowerCase();
  
  if (hostname.includes('autotrader')) return 'autotrader';
  if (hostname.includes('cars.com')) return 'cars';
  if (hostname.includes('cargurus')) return 'cargurus';
  if (hostname.includes('dealer.com')) return 'dealer';
  if (hostname.includes('carmax')) return 'carmax';
  
  return 'unknown';
}

// Wait for page to fully load
function waitForPageLoad() {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', resolve, { once: true });
    }
  });
}

// Main scraping function
async function scrapeVehicles() {
  const config = siteConfigs[currentSite];
  if (!config) {
    throw new Error(`Unsupported website: ${currentSite}`);
  }
  
  // Find vehicle cards
  const vehicleCards = document.querySelectorAll(config.vehicleCards);
  console.log(`Found ${vehicleCards.length} vehicle cards`);
  
  if (vehicleCards.length === 0) {
    // Try to scroll and wait for dynamic content
    await scrollAndWait();
    const newCards = document.querySelectorAll(config.vehicleCards);
    if (newCards.length === 0) {
      throw new Error('No vehicle listings found on this page');
    }
  }
  
  const totalCards = Math.min(vehicleCards.length, maxVehicles);
  
  for (let i = 0; i < totalCards && isScrapingActive; i++) {
    const card = vehicleCards[i];
    
    try {
      const vehicleData = await extractVehicleData(card, config);
      
      if (vehicleData && isValidVehicleData(vehicleData)) {
        scrapedVehicles.push(vehicleData);
        console.log(`Extracted vehicle ${i + 1}: ${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`);
      }
      
      // Update progress
      const progress = Math.round(((i + 1) / totalCards) * 100);
      sendProgressUpdate(progress, false);
      
      // Small delay to avoid being too aggressive
      await delay(100);
      
    } catch (error) {
      console.error(`Failed to extract vehicle data from card ${i + 1}:`, error);
    }
  }
}

// Extract data from a single vehicle card
async function extractVehicleData(card, config) {
  try {
    // Extract basic information
    const title = extractText(card, config.title);
    const priceText = extractText(card, config.price);
    const mileageText = extractText(card, config.mileage);
    
    // Parse title for make, model, year
    const titleParts = parseVehicleTitle(title);
    if (!titleParts.make || !titleParts.model || !titleParts.year) {
      console.warn('Could not parse vehicle title:', title);
      return null;
    }
    
    // Extract VIN
    let vin = extractText(card, config.vin);
    if (!vin) {
      // Look for VIN in the entire card text
      vin = extractVinFromText(card.textContent);
    }
    
    if (!vin || !validateVin(vin)) {
      console.warn('No valid VIN found for vehicle:', title);
      // Don't skip vehicles without VINs as some sites may not display them
    }
    
    // Extract images
    const images = extractImages(card, config.images);
    
    // Extract additional details
    const dealer = extractText(card, config.dealer);
    const location = extractText(card, config.location);
    const features = extractTextArray(card, config.features);
    const transmission = extractText(card, config.transmission);
    const fuelType = extractText(card, config.fuelType);
    const exteriorColor = extractText(card, config.exteriorColor);
    const description = extractText(card, config.description);
    
    const vehicleData = {
      vin: vin || `UNKNOWN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      make: titleParts.make,
      model: titleParts.model,
      year: titleParts.year,
      trim: titleParts.trim || null,
      price: parsePrice(priceText),
      mileage: parseMileage(mileageText),
      transmission: transmission || null,
      fuelType: fuelType || null,
      exteriorColor: exteriorColor || null,
      interiorColor: null, // Rarely available on listing pages
      features: features,
      images: images,
      description: description || null,
      sourceUrl: window.location.href,
      sourceSite: getSiteDisplayName(currentSite),
      dealerName: dealer || null,
      dealerLocation: location || null,
      status: 'scraped',
      scrapedAt: new Date().toISOString()
    };
    
    return vehicleData;
    
  } catch (error) {
    console.error('Error extracting vehicle data:', error);
    return null;
  }
}

// Helper function to extract text from element
function extractText(container, selector) {
  if (!selector) return null;
  
  try {
    const element = container.querySelector(selector);
    return element ? element.textContent.trim() : null;
  } catch (error) {
    return null;
  }
}

// Helper function to extract text array from elements
function extractTextArray(container, selector) {
  if (!selector) return [];
  
  try {
    const elements = container.querySelectorAll(selector);
    return Array.from(elements).map(el => el.textContent.trim()).filter(text => text.length > 0);
  } catch (error) {
    return [];
  }
}

// Helper function to extract images
function extractImages(container, selector) {
  if (!selector) return [];
  
  try {
    const imgElements = container.querySelectorAll(selector);
    return Array.from(imgElements)
      .map(img => img.src || img.getAttribute('data-src'))
      .filter(src => src && src.startsWith('http'))
      .slice(0, 5); // Limit to 5 images
  } catch (error) {
    return [];
  }
}

// Parse vehicle title to extract make, model, year, trim
function parseVehicleTitle(title) {
  if (!title) return {};
  
  // Common patterns for vehicle titles
  const patterns = [
    /(\d{4})\s+([A-Za-z]+)\s+([A-Za-z0-9\-]+)(?:\s+(.+))?/,  // "2022 Toyota Camry LE"
    /([A-Za-z]+)\s+([A-Za-z0-9\-]+)\s+(\d{4})(?:\s+(.+))?/,  // "Toyota Camry 2022 LE"
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      if (match[1].match(/^\d{4}$/)) {
        // Year first pattern
        return {
          year: parseInt(match[1]),
          make: match[2],
          model: match[3],
          trim: match[4] || null
        };
      } else {
        // Make first pattern
        return {
          make: match[1],
          model: match[2],
          year: parseInt(match[3]),
          trim: match[4] || null
        };
      }
    }
  }
  
  // Fallback: try to extract year from anywhere in title
  const yearMatch = title.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? parseInt(yearMatch[0]) : null;
  
  return { year, make: null, model: null, trim: null };
}

// Parse price from text
function parsePrice(priceText) {
  if (!priceText) return '0';
  
  // Remove currency symbols and extract number
  const match = priceText.replace(/[^\d.]/g, '');
  return match || '0';
}

// Parse mileage from text
function parseMileage(mileageText) {
  if (!mileageText) return 0;
  
  // Extract number and handle "K" suffix
  const match = mileageText.match(/[\d,]+/);
  if (!match) return 0;
  
  const number = parseInt(match[0].replace(/,/g, ''));
  
  // Check if it's in thousands (K suffix)
  if (mileageText.toLowerCase().includes('k') && number < 1000) {
    return number * 1000;
  }
  
  return number;
}

// Extract VIN from text content
function extractVinFromText(text) {
  const vins = text.match(VIN_REGEX);
  if (vins && vins.length > 0) {
    return vins.find(vin => validateVin(vin)) || null;
  }
  return null;
}

// Validate VIN format
function validateVin(vin) {
  if (!vin || typeof vin !== 'string') return false;
  
  const cleanVin = vin.replace(/\s+/g, '').toUpperCase();
  
  // VIN must be exactly 17 characters
  if (cleanVin.length !== 17) return false;
  
  // VIN cannot contain I, O, or Q
  if (/[IOQ]/.test(cleanVin)) return false;
  
  // Must be alphanumeric
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(cleanVin)) return false;
  
  return true;
}

// Validate extracted vehicle data
function isValidVehicleData(vehicle) {
  if (!vehicle) return false;
  
  // Required fields
  if (!vehicle.make || !vehicle.model) return false;
  if (!vehicle.year || vehicle.year < 1900 || vehicle.year > new Date().getFullYear() + 2) return false;
  if (!vehicle.price || parseFloat(vehicle.price) <= 0) return false;
  if (vehicle.mileage < 0) return false;
  
  return true;
}

// Get display name for site
function getSiteDisplayName(site) {
  const displayNames = {
    autotrader: 'AutoTrader',
    cars: 'Cars.com',
    cargurus: 'CarGurus',
    dealer: 'Dealer.com',
    carmax: 'CarMax'
  };
  
  return displayNames[site] || site;
}

// Scroll page and wait for dynamic content
async function scrollAndWait() {
  return new Promise((resolve) => {
    let scrollCount = 0;
    const maxScrolls = 3;
    
    const scrollInterval = setInterval(() => {
      window.scrollBy(0, window.innerHeight);
      scrollCount++;
      
      if (scrollCount >= maxScrolls) {
        clearInterval(scrollInterval);
        // Wait a bit more for content to load
        setTimeout(resolve, 1000);
      }
    }, 500);
  });
}

// Send progress update to background script
function sendProgressUpdate(progress, completed, error = null) {
  chrome.runtime.sendMessage({
    action: 'scrapingProgress',
    data: {
      progress,
      completed,
      error,
      vehiclesFound: scrapedVehicles.length
    }
  }).catch(() => {
    // Background script might not be available
  });
}

// Utility delay function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize content script
console.log('VinScraper content script loaded on:', window.location.hostname);
