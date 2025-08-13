import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Vehicle } from "@shared/schema";
import VehicleDetailsModal from "@/components/modals/vehicle-details-modal";

export default function Inventory() {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedSource, setSelectedSource] = useState("All Sources");
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 20;

  interface VehiclesResponse {
    vehicles: Vehicle[];
    total: number;
  }

  const { data, isLoading, refetch } = useQuery<VehiclesResponse>({
    queryKey: ["/api/vehicles", { limit, offset: currentPage * limit }],
  });

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (data && (currentPage + 1) * limit < data.total) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scraped":
        return "bg-green-100 text-green-800";
      case "posted":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case "autotrader":
        return "bg-blue-100 text-blue-800";
      case "cars.com":
        return "bg-green-100 text-green-800";
      case "cargurus":
        return "bg-purple-100 text-purple-800";
      case "dealer.com":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const vehicles = data?.vehicles || [];
  const total = data?.total || 0;
  const start = currentPage * limit + 1;
  const end = Math.min((currentPage + 1) * limit, total);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Vehicle Inventory</h1>
            <p className="text-slate-600">Manage and review all scraped vehicle data</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            {/* Header Controls */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                    <input
                      type="text"
                      placeholder="Search vehicles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm w-80"
                      data-testid="input-search"
                    />
                  </div>
                  <select
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    data-testid="filter-source"
                  >
                    <option>All Sources</option>
                    <option>AutoTrader</option>
                    <option>Cars.com</option>
                    <option>CarGurus</option>
                    <option>Dealer.com</option>
                  </select>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-600">
                    {total > 0 ? `${start}-${end} of ${total} vehicles` : 'No vehicles'}
                  </span>
                  <button
                    onClick={() => refetch()}
                    className="text-slate-500 hover:text-slate-700 p-2"
                    data-testid="button-refresh"
                  >
                    <i className="fas fa-sync-alt"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Vehicle Grid */}
            <div className="p-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-slate-200 rounded-lg h-48 mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : vehicles.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-car text-4xl text-slate-300 mb-4"></i>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No vehicles found</h3>
                  <p className="text-slate-500">Start scraping dealership websites to see vehicles here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedVehicle(vehicle)}
                      data-testid={`vehicle-card-${vehicle.id}`}
                    >
                      <div className="h-48 bg-slate-200 flex items-center justify-center">
                        {vehicle.images && vehicle.images.length > 0 ? (
                          <img
                            src={vehicle.images[0]}
                            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <i className="fas fa-car text-4xl text-slate-400"></i>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              vehicle.status
                            )}`}
                          >
                            {vehicle.status === "scraped" ? "Scraped" : vehicle.status === "posted" ? "Posted" : "Failed"}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(
                              vehicle.sourceSite
                            )}`}
                          >
                            {vehicle.sourceSite}
                          </span>
                        </div>
                        
                        <h3 className="font-semibold text-slate-900 mb-1 truncate">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h3>
                        
                        {vehicle.trim && (
                          <p className="text-sm text-slate-600 mb-2 truncate">{vehicle.trim}</p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-slate-900">${vehicle.price}</span>
                          <span className="text-sm text-slate-500">{vehicle.mileage.toLocaleString()} mi</span>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-xs font-mono text-slate-500 truncate">VIN: {vehicle.vin}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {total > limit && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 0}
                    className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="button-previous"
                  >
                    <i className="fas fa-chevron-left mr-2"></i>
                    Previous
                  </button>
                  
                  <span className="text-sm text-slate-600">
                    Page {currentPage + 1} of {Math.ceil(total / limit)}
                  </span>
                  
                  <button
                    onClick={handleNextPage}
                    disabled={(currentPage + 1) * limit >= total}
                    className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="button-next"
                  >
                    Next
                    <i className="fas fa-chevron-right ml-2"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedVehicle && (
        <VehicleDetailsModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      )}
    </div>
  );
}