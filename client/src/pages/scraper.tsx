import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Scraper() {
  const [url, setUrl] = useState("");
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const scrapeMutation = useMutation({
    mutationFn: async (data: { url: string }) => {
      const response = await apiRequest("POST", "/api/scraper/start", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Scraping started successfully" });
      setIsScrapingActive(true);
      queryClient.invalidateQueries({ queryKey: ["/api/scraping-logs"] });
    },
    onError: () => {
      toast({ 
        title: "Failed to start scraping",
        description: "Please check the URL and try again",
        variant: "destructive"
      });
    },
  });

  const handleStartScraping = () => {
    if (!url) {
      toast({
        title: "URL required",
        description: "Please enter a valid dealership URL",
        variant: "destructive"
      });
      return;
    }
    scrapeMutation.mutate({ url });
  };

  const supportedSites = [
    {
      name: "AutoTrader",
      url: "autotrader.com",
      icon: "fas fa-car",
      color: "text-blue-600",
      status: "Active"
    },
    {
      name: "Cars.com",
      url: "cars.com",
      icon: "fas fa-automobile",
      color: "text-green-600",
      status: "Active"
    },
    {
      name: "CarGurus",
      url: "cargurus.com",
      icon: "fas fa-car-side",
      color: "text-purple-600",
      status: "Active"
    },
    {
      name: "Dealer.com",
      url: "dealer.com",
      icon: "fas fa-store",
      color: "text-orange-600",
      status: "Beta"
    }
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Vehicle Scraper</h1>
            <p className="text-slate-600">Scrape vehicle data from supported dealership websites</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Scraping Control Panel */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Start New Scraping Session</h3>
                  <p className="text-sm text-slate-600">Enter a dealership URL to begin scraping vehicle data</p>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Dealership URL
                      </label>
                      <div className="flex space-x-3">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="https://autotrader.com/cars-for-sale/..."
                          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          data-testid="input-scraper-url"
                        />
                        <button
                          onClick={handleStartScraping}
                          disabled={scrapeMutation.isPending || isScrapingActive}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          data-testid="button-start-scraping"
                        >
                          {scrapeMutation.isPending ? (
                            <>
                              <i className="fas fa-spinner animate-spin"></i>
                              <span>Starting...</span>
                            </>
                          ) : isScrapingActive ? (
                            <>
                              <i className="fas fa-stop"></i>
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <i className="fas fa-play"></i>
                              <span>Start Scraping</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {isScrapingActive && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-900">Scraping Progress</span>
                          <span className="text-sm text-blue-700">{scrapingProgress}%</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${scrapingProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-blue-700 mt-2">
                          Scanning for vehicle listings...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chrome Extension Setup */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Chrome Extension</h3>
                  <p className="text-sm text-slate-600">Install the VinScraper Chrome extension for enhanced scraping</p>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <i className="fab fa-chrome text-2xl text-green-600"></i>
                      <div>
                        <p className="font-medium text-green-900">Extension Status</p>
                        <p className="text-sm text-green-700">Ready for use</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                      Open Extension
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Supported Sites */}
            <div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Supported Sites</h3>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {supportedSites.map((site) => (
                      <div
                        key={site.name}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        data-testid={`supported-site-${site.name.toLowerCase()}`}
                      >
                        <div className="flex items-center space-x-3">
                          <i className={`${site.icon} ${site.color} text-lg`}></i>
                          <div>
                            <p className="font-medium text-slate-900">{site.name}</p>
                            <p className="text-xs text-slate-500">{site.url}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          site.status === "Active" 
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {site.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
                      <div>
                        <p className="text-sm font-medium text-blue-900">How It Works</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Our Chrome extension bypasses CORS restrictions and extracts vehicle data including VIN, pricing, mileage, and specifications from dealership inventory pages.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}