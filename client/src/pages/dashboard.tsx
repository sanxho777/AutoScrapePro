import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCards from "@/components/dashboard/stats-cards";
import VehicleTable from "@/components/dashboard/vehicle-table";
import ScrapingPanel from "@/components/dashboard/scraping-panel";
import FacebookPanel from "@/components/dashboard/facebook-panel";
import ActivityFeed from "@/components/dashboard/activity-feed";
import VehicleDetailsModal from "@/components/modals/vehicle-details-modal";
import { Vehicle } from "@shared/schema";

export default function Dashboard() {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="p-6">
          <StatsCards />
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <VehicleTable onVehicleSelect={setSelectedVehicle} />
            </div>
            
            <div className="space-y-6">
              <ScrapingPanel />
              <FacebookPanel />
              <ActivityFeed />
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
