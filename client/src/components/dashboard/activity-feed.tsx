import { useQuery } from "@tanstack/react-query";
import { ScrapingLog } from "@shared/schema";

export default function ActivityFeed() {
  const { data: logs, isLoading } = useQuery<ScrapingLog[]>({
    queryKey: ["/api/scraping-logs", { limit: 5 }],
  });

  const getActivityIcon = (status: string) => {
    switch (status) {
      case "success":
        return { icon: "fas fa-check-circle", color: "bg-success" };
      case "failed":
        return { icon: "fas fa-exclamation-circle", color: "bg-error" };
      default:
        return { icon: "fas fa-clock", color: "bg-warning" };
    }
  };

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return "Unknown time";
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return "Just now";
  };

  const getActivityMessage = (log: ScrapingLog) => {
    if (log.status === "success") {
      return `Successfully scraped ${log.vehiclesScraped || 0} vehicles from ${log.sourceSite}`;
    } else if (log.status === "failed") {
      return `Failed to scrape ${log.sourceSite}: ${log.errorMessage || "Unknown error"}`;
    } else {
      return `Started scraping ${log.sourceSite}`;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="activity-feed">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start space-x-3">
                <div className="w-2 h-2 bg-slate-200 rounded-full mt-2"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : logs && logs.length > 0 ? (
          <div className="space-y-4">
            {logs.map((log) => {
              const activity = getActivityIcon(log.status);
              return (
                <div key={log.id} className="flex items-start space-x-3" data-testid={`activity-${log.id}`}>
                  <div className={`w-2 h-2 ${activity.color} rounded-full mt-2`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">{getActivityMessage(log)}</p>
                    <p className="text-xs text-secondary mt-1">
                      {formatTimeAgo(log.startedAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <i className="fas fa-history text-4xl text-slate-300 mb-4 block"></i>
            <p className="text-slate-500 font-medium">No recent activity</p>
            <p className="text-sm text-slate-400 mt-1">
              Start scraping websites to see activity here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
