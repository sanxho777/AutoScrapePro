import { useQuery } from "@tanstack/react-query";
import { FacebookGroup } from "@shared/schema";

export default function FacebookPanel() {
  const { data: groups, isLoading } = useQuery<FacebookGroup[]>({
    queryKey: ["/api/facebook-groups"],
  });

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return "Never";
    
    // Handle case where date might be a string
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (!dateObj || isNaN(dateObj.getTime())) {
      return "Never";
    }
    
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  const getStatusColor = (lastPosted: Date | null) => {
    if (!lastPosted) return "bg-gray-500";
    
    // Handle case where lastPosted might be a string
    const lastPostedDate = typeof lastPosted === 'string' ? new Date(lastPosted) : lastPosted;
    
    if (!lastPostedDate || isNaN(lastPostedDate.getTime())) {
      return "bg-gray-500";
    }
    
    const now = new Date();
    const diff = now.getTime() - lastPostedDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 6) return "bg-success";
    if (hours < 24) return "bg-yellow-500";
    return "bg-gray-500";
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm" data-testid="facebook-panel">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
          <i className="fab fa-facebook text-blue-600"></i>
          <span>Facebook Groups</span>
        </h3>
        <p className="text-sm text-secondary mt-1">Manage your posting groups</p>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                  </div>
                  <div className="h-3 bg-slate-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        ) : groups && groups.length > 0 ? (
          <div className="space-y-3">
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                data-testid={`facebook-group-${group.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusColor(group.lastPostedAt)}`}
                  ></div>
                  <span className="text-sm font-medium text-slate-900">{group.name}</span>
                </div>
                <span className="text-xs text-secondary">
                  {formatTimeAgo(group.lastPostedAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <i className="fab fa-facebook text-4xl text-slate-300 mb-4 block"></i>
            <p className="text-slate-500 font-medium">No Facebook groups connected</p>
            <p className="text-sm text-slate-400 mt-1">
              Connect Facebook groups to start posting vehicles
            </p>
          </div>
        )}
        <button
          className="w-full mt-4 border border-slate-300 text-slate-700 py-2 px-4 rounded-lg font-medium hover:bg-slate-50 transition-colors text-sm"
          data-testid="button-manage-groups"
        >
          Manage Groups
        </button>
      </div>
    </div>
  );
}
