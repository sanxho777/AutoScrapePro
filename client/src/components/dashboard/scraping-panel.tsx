import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ScrapingPanel() {
  const [url, setUrl] = useState("");
  const [sourceSite, setSourceSite] = useState("Auto-detect");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const scrapeMutation = useMutation({
    mutationFn: async (data: { url: string; sourceSite: string }) => {
      const response = await apiRequest("POST", "/api/scrape", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Scraping Started",
        description: "The Chrome extension will begin scraping the website.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setUrl("");
    },
    onError: () => {
      toast({
        title: "Scraping Failed",
        description: "Failed to initiate scraping. Please check the URL and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    const detectedSite = sourceSite === "Auto-detect" ? detectSiteFromUrl(url) : sourceSite;
    scrapeMutation.mutate({ url, sourceSite: detectedSite });
  };

  const detectSiteFromUrl = (url: string): string => {
    const hostname = new URL(url).hostname.toLowerCase();
    
    if (hostname.includes("autotrader")) return "AutoTrader";
    if (hostname.includes("cars.com")) return "Cars.com";
    if (hostname.includes("cargurus")) return "CarGurus";
    if (hostname.includes("dealer.com")) return "Dealer.com";
    if (hostname.includes("carmax")) return "CarMax";
    
    return "Unknown";
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="scraping-panel">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Quick Scrape</h3>
        <p className="text-sm text-secondary mt-1">Enter a URL to scrape vehicle data</p>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Website URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="https://www.autotrader.com/cars-for-sale..."
              required
              data-testid="input-url"
            />
            {url && !isValidUrl(url) && (
              <p className="text-xs text-red-600 mt-1">Please enter a valid URL</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Source
            </label>
            <select
              value={sourceSite}
              onChange={(e) => setSourceSite(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              data-testid="select-source"
            >
              <option>Auto-detect</option>
              <option>AutoTrader</option>
              <option>Cars.com</option>
              <option>CarGurus</option>
              <option>Dealer.com</option>
              <option>CarMax</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={!url || !isValidUrl(url) || scrapeMutation.isPending}
            className="w-full bg-primary text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            data-testid="button-start-scraping"
          >
            <i className="fas fa-spider w-4 h-4"></i>
            <span>
              {scrapeMutation.isPending ? "Starting..." : "Start Scraping"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
