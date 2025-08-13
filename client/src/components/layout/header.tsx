export default function Header() {
  const handleScrapeNew = () => {
    // This would open the scraping panel or modal
    console.log("Opening scraper...");
  };

  const handleBulkExport = () => {
    console.log("Exporting data...");
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4" data-testid="main-header">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-sm text-secondary mt-1">
            Manage your vehicle inventory and scraping operations
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Quick Actions */}
          <button
            onClick={handleScrapeNew}
            className="bg-primary text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors flex items-center space-x-2"
            data-testid="button-scrape-new"
          >
            <i className="fas fa-plus w-4 h-4"></i>
            <span>Scrape New Site</span>
          </button>
          <button
            onClick={handleBulkExport}
            className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors flex items-center space-x-2"
            data-testid="button-export"
          >
            <i className="fas fa-download w-4 h-4"></i>
            <span>Export Data</span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center" data-testid="user-avatar">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
