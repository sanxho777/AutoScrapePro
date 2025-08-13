import { Vehicle } from "@shared/schema";

interface VehicleDetailsModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export default function VehicleDetailsModal({ vehicle, onClose }: VehicleDetailsModalProps) {
  const generateMarketplaceListing = () => {
    const description = [
      `🚗 ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`,
      `📊 ${vehicle.mileage.toLocaleString()} miles`,
      `💰 $${vehicle.price}`,
    ];

    if (vehicle.transmission) description.push(`⚙️ ${vehicle.transmission}`);
    if (vehicle.fuelType) description.push(`⛽ ${vehicle.fuelType}`);
    if (vehicle.exteriorColor) description.push(`🎨 ${vehicle.exteriorColor} exterior`);
    if (vehicle.interiorColor) description.push(`🪑 ${vehicle.interiorColor} interior`);

    if (vehicle.features && vehicle.features.length > 0) {
      description.push(`✨ Features: ${vehicle.features.slice(0, 8).join(', ')}`);
    }

    description.push(`📋 VIN: ${vehicle.vin}`);
    
    if (vehicle.dealerName) {
      description.push(`🏪 Available at ${vehicle.dealerName}`);
    }

    const listingText = description.join('\n\n');
    const marketplaceUrl = `https://www.facebook.com/marketplace/create/vehicle?title=${encodeURIComponent(`${vehicle.year} ${vehicle.make} ${vehicle.model}`)}&price=${vehicle.price}&description=${encodeURIComponent(listingText)}`;
    
    window.open(marketplaceUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            data-testid="button-close-modal"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Images */}
            <div>
              <div className="aspect-video bg-slate-200 rounded-lg mb-4 flex items-center justify-center">
                {vehicle.images && vehicle.images.length > 0 ? (
                  <img
                    src={vehicle.images[0]}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <i className="fas fa-car text-4xl text-slate-400"></i>
                )}
              </div>
              
              {vehicle.images && vehicle.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {vehicle.images.slice(1, 5).map((image, index) => (
                    <div key={index} className="aspect-square bg-slate-200 rounded">
                      <img
                        src={image}
                        alt={`Vehicle image ${index + 2}`}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-slate-900">${vehicle.price}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    vehicle.status === "scraped" ? "bg-green-100 text-green-800" :
                    vehicle.status === "posted" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {vehicle.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Mileage:</span>
                    <span className="ml-2 font-medium">{vehicle.mileage.toLocaleString()} miles</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Transmission:</span>
                    <span className="ml-2 font-medium">{vehicle.transmission || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Fuel Type:</span>
                    <span className="ml-2 font-medium">{vehicle.fuelType || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Exterior:</span>
                    <span className="ml-2 font-medium">{vehicle.exteriorColor || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Interior:</span>
                    <span className="ml-2 font-medium">{vehicle.interiorColor || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Source:</span>
                    <span className="ml-2 font-medium">{vehicle.sourceSite}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              {vehicle.features && vehicle.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {vehicle.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 mb-3">Description</h3>
                  <p className="text-slate-600 text-sm">{vehicle.description}</p>
                </div>
              )}

              {/* VIN and Dealer Info */}
              <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-600">VIN:</span>
                    <span className="ml-2 font-mono font-medium">{vehicle.vin}</span>
                  </div>
                  {vehicle.dealerName && (
                    <div>
                      <span className="text-slate-600">Dealer:</span>
                      <span className="ml-2 font-medium">{vehicle.dealerName}</span>
                    </div>
                  )}
                  {vehicle.dealerLocation && (
                    <div>
                      <span className="text-slate-600">Location:</span>
                      <span className="ml-2 font-medium">{vehicle.dealerLocation}</span>
                    </div>
                  )}
                  {vehicle.sourceUrl && (
                    <div>
                      <span className="text-slate-600">Source:</span>
                      <a 
                        href={vehicle.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        View Original Listing
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={generateMarketplaceListing}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                  data-testid="button-generate-listing"
                >
                  <i className="fab fa-facebook"></i>
                  <span>Generate Marketplace Listing</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}