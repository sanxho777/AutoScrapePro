import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Vehicle } from "@shared/schema";

interface VehicleTableProps {
  onVehicleSelect: (vehicle: Vehicle) => void;
}

export default function VehicleTable({ onVehicleSelect }: VehicleTableProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedSource, setSelectedSource] = useState("All Sources");
  const limit = 10;

  interface VehiclesResponse {
    vehicles: Vehicle[];
    total: number;
  }

  const { data, isLoading, refetch } = useQuery<VehiclesResponse>({
    queryKey: ["/api/vehicles", { limit, offset: currentPage * limit }],
  });

  const handleRefresh = () => {
    refetch();
  };

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

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const vehicles = data?.vehicles || [];
  const total = data?.total || 0;
  const start = currentPage * limit + 1;
  const end = Math.min((currentPage + 1) * limit, total);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="vehicle-table">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Recent Vehicles</h3>
          <div className="flex items-center space-x-3">
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
            <button
              onClick={handleRefresh}
              className="text-slate-500 hover:text-slate-700 p-2"
              data-testid="button-refresh"
            >
              <i className="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                VIN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="text-slate-500">
                    <i className="fas fa-car text-4xl mb-4 block"></i>
                    <p className="text-lg font-medium mb-2">No vehicles found</p>
                    <p className="text-sm">Start scraping dealership websites to see vehicles here</p>
                  </div>
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="hover:bg-slate-50 transition-colors"
                  data-testid={`vehicle-row-${vehicle.id}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-9 bg-slate-200 rounded flex items-center justify-center">
                        <i className="fas fa-car text-slate-400"></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                        </p>
                        <p className="text-xs text-secondary">
                          {vehicle.mileage.toLocaleString()} miles
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
                      {vehicle.vin}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    ${vehicle.price}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSourceColor(
                        vehicle.sourceSite
                      )}`}
                    >
                      {vehicle.sourceSite}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        vehicle.status
                      )}`}
                    >
                      <i
                        className={`w-3 h-3 mr-1 ${
                          vehicle.status === "scraped"
                            ? "fas fa-check-circle"
                            : vehicle.status === "posted"
                            ? "fas fa-clock"
                            : "fas fa-exclamation-circle"
                        }`}
                      ></i>
                      {vehicle.status === "scraped"
                        ? "Scraped"
                        : vehicle.status === "posted"
                        ? "Posted"
                        : "Failed"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onVehicleSelect(vehicle)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        data-testid={`button-view-${vehicle.id}`}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        data-testid={`button-facebook-${vehicle.id}`}
                      >
                        <i className="fab fa-facebook"></i>
                      </button>
                      <button
                        className="text-slate-500 hover:text-slate-700 text-sm"
                        data-testid={`button-delete-${vehicle.id}`}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {vehicles.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-secondary">
            Showing <span className="font-medium">{start}</span> to{" "}
            <span className="font-medium">{end}</span> of{" "}
            <span className="font-medium">{total}</span> vehicles
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              data-testid="button-previous"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={(currentPage + 1) * limit >= total}
              className="px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              data-testid="button-next"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
