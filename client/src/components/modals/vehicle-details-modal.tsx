import { Vehicle } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface VehicleDetailsModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export default function VehicleDetailsModal({ vehicle, onClose }: VehicleDetailsModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePostToFacebook = () => {
    console.log("Posting to Facebook:", vehicle.id);
    // Implement Facebook posting logic
  };

  const handleEditVehicle = () => {
    console.log("Editing vehicle:", vehicle.id);
    // Implement edit functionality
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      data-testid="vehicle-details-modal"
    >
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">Vehicle Details</h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
            data-testid="button-close-modal"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {/* Main Image */}
              <div className="w-full h-64 bg-slate-200 rounded-lg flex items-center justify-center mb-4">
                {vehicle.images && vehicle.images.length > 0 ? (
                  <img
                    src={vehicle.images[0]}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-slate-400">
                    <i className="fas fa-car text-6xl mb-2 block"></i>
                    <p>No image available</p>
                  </div>
                )}
              </div>
              
              {/* Thumbnail Images */}
              {vehicle.images && vehicle.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {vehicle.images.slice(1, 5).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Vehicle image ${index + 2}`}
                      className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">
                  {vehicle.year} {vehicle.make} {vehicle.model}{" "}
                  {vehicle.trim && vehicle.trim}
                </h4>
                <p className="text-2xl font-bold text-primary mt-2">
                  ${vehicle.price}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs font-medium text-secondary uppercase tracking-wide">
                    Mileage
                  </p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">
                    {vehicle.mileage.toLocaleString()} miles
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs font-medium text-secondary uppercase tracking-wide">
                    Year
                  </p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">
                    {vehicle.year}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs font-medium text-secondary uppercase tracking-wide">
                    Transmission
                  </p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">
                    {vehicle.transmission || "Not specified"}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs font-medium text-secondary uppercase tracking-wide">
                    Fuel Type
                  </p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">
                    {vehicle.fuelType || "Not specified"}
                  </p>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-slate-700 mb-2">VIN</h5>
                <code className="bg-slate-100 px-3 py-2 rounded text-sm font-mono block">
                  {vehicle.vin}
                </code>
              </div>

              {vehicle.features && vehicle.features.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-slate-700 mb-2">Features</h5>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {vehicle.description && (
                <div>
                  <h5 className="text-sm font-medium text-slate-700 mb-2">Description</h5>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {vehicle.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-secondary">Source:</p>
                  <p className="font-medium">{vehicle.sourceSite}</p>
                </div>
                <div>
                  <p className="text-secondary">Scraped:</p>
                  <p className="font-medium">
                    {vehicle.scrapedAt
                      ? formatDistanceToNow(vehicle.scrapedAt, { addSuffix: true })
                      : "Unknown"}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handlePostToFacebook}
                  className="flex-1 bg-primary text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  data-testid="button-post-facebook"
                >
                  <i className="fab fa-facebook w-4 h-4"></i>
                  <span>Post to Facebook</span>
                </button>
                <button
                  onClick={handleEditVehicle}
                  className="flex-1 bg-white border border-slate-300 text-slate-700 py-2.5 px-4 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                  data-testid="button-edit-vehicle"
                >
                  Edit Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
