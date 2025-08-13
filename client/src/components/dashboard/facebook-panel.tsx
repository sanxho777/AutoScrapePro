import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Vehicle } from "@shared/schema";

export default function FacebookPanel() {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { data: vehicles, isLoading } = useQuery<{ vehicles: Vehicle[], total: number }>({
    queryKey: ["/api/vehicles", { limit: 5, offset: 0 }],
  });

  const generateMarketplaceListing = async (vehicle: Vehicle) => {
    setIsGenerating(true);
    
    try {
      // Generate optimized Facebook Marketplace listing
      const listing = {
        title: `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`,
        description: generateDescription(vehicle),
        price: vehicle.price,
        images: vehicle.images || [],
        category: 'Vehicle',
        condition: 'Used',
        location: vehicle.dealerLocation || '',
        features: vehicle.features || []
      };
      
      // Copy to clipboard or open Facebook Marketplace with pre-filled data
      const marketplaceUrl = `https://www.facebook.com/marketplace/create/vehicle?title=${encodeURIComponent(listing.title)}&price=${listing.price}&description=${encodeURIComponent(listing.description)}`;
      
      // Open in new tab
      window.open(marketplaceUrl, '_blank');
      
    } catch (error) {
      console.error('Failed to generate listing:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDescription = (vehicle: Vehicle) => {
    const parts = [
      `🚗 ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`,
      `📊 ${vehicle.mileage.toLocaleString()} miles`,
    ];

    if (vehicle.transmission) parts.push(`⚙️ ${vehicle.transmission}`);
    if (vehicle.fuelType) parts.push(`⛽ ${vehicle.fuelType}`);
    if (vehicle.exteriorColor) parts.push(`🎨 ${vehicle.exteriorColor} exterior`);
    if (vehicle.interiorColor) parts.push(`🪑 ${vehicle.interiorColor} interior`);

    if (vehicle.features && vehicle.features.length > 0) {
      parts.push(`✨ Features: ${vehicle.features.slice(0, 5).join(', ')}`);
    }

    parts.push(`💰 $${vehicle.price}`);
    parts.push(`📋 VIN: ${vehicle.vin}`);
    
    if (vehicle.dealerName) {
      parts.push(`🏪 Available at ${vehicle.dealerName}`);
    }

    return parts.join('\n\n');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="facebook-panel">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
          <i className="fab fa-facebook-square text-blue-600"></i>
          <span>Marketplace Listings</span>
        </h3>
        <p className="text-sm text-secondary mt-1">Auto-generate Facebook Marketplace listings</p>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-8 bg-slate-200 rounded"></div>
                    <div className="space-y-1">
                      <div className="h-4 bg-slate-200 rounded w-24"></div>
                      <div className="h-3 bg-slate-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-slate-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : vehicles?.vehicles && vehicles.vehicles.length > 0 ? (
          <div className="space-y-3">
            {vehicles.vehicles.slice(0, 5).map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                data-testid={`marketplace-vehicle-${vehicle.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-8 bg-slate-200 rounded flex items-center justify-center">
                    <i className="fas fa-car text-slate-400 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 truncate max-w-32">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-xs text-slate-500">${vehicle.price}</p>
                  </div>
                </div>
                <button
                  onClick={() => generateMarketplaceListing(vehicle)}
                  disabled={isGenerating}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  data-testid={`button-generate-${vehicle.id}`}
                >
                  {isGenerating ? (
                    <>
                      <i className="fas fa-spinner animate-spin"></i>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-external-link-alt"></i>
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <i className="fas fa-store text-4xl text-slate-300 mb-4 block"></i>
            <p className="text-slate-500 font-medium">No vehicles available</p>
            <p className="text-sm text-slate-400 mt-1">
              Scrape vehicle data to generate marketplace listings
            </p>
          </div>
        )}
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <i className="fas fa-info-circle text-blue-600 mt-0.5 text-sm"></i>
            <div>
              <p className="text-sm font-medium text-blue-900">Auto-Fill Feature</p>
              <p className="text-xs text-blue-700 mt-1">
                Click "Generate" to open Facebook Marketplace with pre-filled vehicle details, including optimized descriptions and pricing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
