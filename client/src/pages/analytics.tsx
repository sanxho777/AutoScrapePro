import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

export default function Analytics() {
  const { data: stats } = useQuery<{
    totalVehicles: number;
    sitesScraped: number;
    facebookPosts: number;
    successRate: number;
  }>({
    queryKey: ["/api/stats"],
  });

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Analytics & Reporting</h1>
            <p className="text-slate-600">Track your scraping performance and marketplace success</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Vehicles</p>
                  <p className="text-2xl font-bold text-slate-900">{stats?.totalVehicles || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-car text-blue-600 text-xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Sites Scraped</p>
                  <p className="text-2xl font-bold text-slate-900">{stats?.sitesScraped || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-globe text-green-600 text-xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Facebook Posts</p>
                  <p className="text-2xl font-bold text-slate-900">{stats?.facebookPosts || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i className="fab fa-facebook text-purple-600 text-xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Success Rate</p>
                  <p className="text-2xl font-bold text-slate-900">{stats?.successRate || 0}%</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-chart-line text-yellow-600 text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Scraping Performance Chart */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Scraping Performance</h3>
              </div>
              <div className="p-6">
                <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                  <div className="text-center">
                    <i className="fas fa-chart-bar text-4xl text-slate-300 mb-4"></i>
                    <p className="text-slate-500 font-medium">Chart visualization coming soon</p>
                    <p className="text-sm text-slate-400">Track scraping success rates over time</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Sources */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Top Sources</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {['AutoTrader', 'Cars.com', 'CarGurus', 'Dealer.com'].map((source, index) => (
                    <div key={source} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                          index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                        }`}></div>
                        <span className="font-medium text-slate-900">{source}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-slate-600">{Math.floor(Math.random() * 50 + 10)} vehicles</span>
                        <span className="text-xs text-green-600">+{Math.floor(Math.random() * 20 + 5)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Scraped 15 vehicles from AutoTrader</p>
                      <p className="text-xs text-slate-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Generated 8 Facebook listings</p>
                      <p className="text-xs text-slate-500">4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Scraped 22 vehicles from Cars.com</p>
                      <p className="text-xs text-slate-500">6 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Export Data</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button className="w-full px-4 py-2 text-left border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center space-x-3">
                    <i className="fas fa-file-csv text-green-600"></i>
                    <span>Export as CSV</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center space-x-3">
                    <i className="fas fa-file-excel text-green-700"></i>
                    <span>Export as Excel</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center space-x-3">
                    <i className="fas fa-file-pdf text-red-600"></i>
                    <span>Generate Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}