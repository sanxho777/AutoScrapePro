import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { QuickPost } from "@/components/facebook/quick-post";
import { Vehicle } from "@shared/schema";

export default function Facebook() {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { data: vehicles, isLoading } = useQuery<{ vehicles: Vehicle[], total: number }>({
    queryKey: ["/api/vehicles", { limit: 20, offset: 0 }],
  });

  const generateMarketplaceListing = async (vehicle: Vehicle) => {
    setIsGenerating(true);
    setSelectedVehicle(vehicle);
    
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
      
      // Create the marketplace URL with pre-filled data
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
      `💰 $${vehicle.price}`,
    ];

    if (vehicle.transmission) parts.push(`⚙️ ${vehicle.transmission}`);
    if (vehicle.fuelType) parts.push(`⛽ ${vehicle.fuelType}`);
    if (vehicle.exteriorColor) parts.push(`🎨 ${vehicle.exteriorColor} exterior`);
    if (vehicle.interiorColor) parts.push(`🪑 ${vehicle.interiorColor} interior`);

    if (vehicle.features && vehicle.features.length > 0) {
      parts.push(`✨ Features: ${vehicle.features.slice(0, 8).join(', ')}`);
    }

    parts.push(`📋 VIN: ${vehicle.vin}`);
    
    if (vehicle.dealerName) {
      parts.push(`🏪 Available at ${vehicle.dealerName}`);
    }

    if (vehicle.dealerLocation) {
      parts.push(`📍 Located in ${vehicle.dealerLocation}`);
    }

    parts.push('');
    parts.push('🔥 Don\'t miss out on this great deal!');
    parts.push('💬 Message for more details or to schedule a viewing');
    parts.push('#UsedCars #AutoSales #CarDealer #Vehicles');

    return parts.join('\n\n');
  };

  const copyListingToClipboard = async (vehicle: Vehicle) => {
    const listing = generateDescription(vehicle);
    try {
      await navigator.clipboard.writeText(listing);
      alert('Listing copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Facebook Marketplace</h1>
            <p className="text-slate-600">Auto-generate optimized Facebook Marketplace vehicle listings</p>
          </div>

          {/* Quick Post Section */}
          <div className="mb-8">
            <QuickPost />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Vehicle List for Marketplace */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Available Vehicles</h3>
                  <p className="text-sm text-slate-600">Select a vehicle to generate marketplace listing</p>
                </div>
                
                <div className="p-6">
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse p-4 border border-slate-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-16 h-12 bg-slate-200 rounded"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : vehicles?.vehicles && vehicles.vehicles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vehicles.vehicles.map((vehicle) => (
                        <div
                          key={vehicle.id}
                          className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => setSelectedVehicle(vehicle)}
                          data-testid={`facebook-vehicle-${vehicle.id}`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-12 bg-slate-200 rounded flex items-center justify-center">
                              {vehicle.images && vehicle.images.length > 0 ? (
                                <img
                                  src={vehicle.images[0]}
                                  alt={`${vehicle.make} ${vehicle.model}`}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <i className="fas fa-car text-slate-400"></i>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900 mb-1">
                                {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                              </h4>
                              <div className="flex items-center justify-between text-sm text-slate-600">
                                <span>${vehicle.price}</span>
                                <span>{vehicle.mileage.toLocaleString()} mi</span>
                              </div>
                              <div className="mt-2 flex space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    generateMarketplaceListing(vehicle);
                                  }}
                                  disabled={isGenerating}
                                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                  Generate Listing
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyListingToClipboard(vehicle);
                                  }}
                                  className="px-3 py-1 text-xs border border-slate-300 text-slate-700 rounded hover:bg-slate-50"
                                >
                                  Copy Text
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <i className="fas fa-car text-4xl text-slate-300 mb-4"></i>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">No vehicles available</h3>
                      <p className="text-slate-500">Scrape vehicle data to generate marketplace listings</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Listing Preview */}
            <div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Listing Preview</h3>
                </div>
                
                <div className="p-6">
                  {selectedVehicle ? (
                    <div className="space-y-4">
                      <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center">
                        {selectedVehicle.images && selectedVehicle.images.length > 0 ? (
                          <img
                            src={selectedVehicle.images[0]}
                            alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <i className="fas fa-car text-4xl text-slate-400"></i>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-lg text-slate-900 mb-2">
                          {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model} {selectedVehicle.trim}
                        </h4>
                        <p className="text-2xl font-bold text-blue-600 mb-4">${selectedVehicle.price}</p>
                        
                        <div className="text-sm text-slate-600 whitespace-pre-wrap">
                          {generateDescription(selectedVehicle)}
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <button
                          onClick={() => generateMarketplaceListing(selectedVehicle)}
                          disabled={isGenerating}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          {isGenerating ? (
                            <>
                              <i className="fas fa-spinner animate-spin"></i>
                              <span>Opening Facebook...</span>
                            </>
                          ) : (
                            <>
                              <i className="fab fa-facebook"></i>
                              <span>Post to Marketplace</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <i className="fas fa-hand-pointer text-3xl text-slate-300 mb-4"></i>
                      <p className="text-slate-500">Select a vehicle to preview listing</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Listing Tips</h3>
                </div>
                
                <div className="p-6">
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-600 mt-1"></i>
                      <span>High-quality photos increase views by 3x</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-600 mt-1"></i>
                      <span>Include VIN for buyer confidence</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-600 mt-1"></i>
                      <span>Respond to messages within 1 hour</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-600 mt-1"></i>
                      <span>Use emojis to make listings stand out</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}