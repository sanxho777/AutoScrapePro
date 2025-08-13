import { useQuery } from "@tanstack/react-query";

interface StatsResponse {
  totalVehicles: number;
  sitesScraped: number;
  facebookPosts: number;
  successRate: number;
}

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery<StatsResponse>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-20"></div>
                <div className="h-8 bg-slate-200 rounded w-12"></div>
              </div>
              <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Vehicles",
      value: stats?.totalVehicles || 0,
      icon: "fas fa-car",
      iconBg: "bg-blue-100",
      iconColor: "text-primary",
      change: "+12%",
      changeText: "from last week",
      testId: "stat-total-vehicles",
    },
    {
      title: "Sites Scraped",
      value: stats?.sitesScraped || 0,
      icon: "fas fa-spider",
      iconBg: "bg-green-100",
      iconColor: "text-success",
      change: "AutoTrader, Cars.com, CarGurus",
      changeText: "",
      testId: "stat-sites-scraped",
    },
    {
      title: "Facebook Posts",
      value: stats?.facebookPosts || 0,
      icon: "fab fa-facebook",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      change: "18",
      changeText: "groups active",
      testId: "stat-facebook-posts",
    },
    {
      title: "Success Rate",
      value: `${stats?.successRate || 0}%`,
      icon: "fas fa-check-circle",
      iconBg: "bg-green-100",
      iconColor: "text-success",
      change: "VIN extraction accuracy",
      changeText: "",
      testId: "stat-success-rate",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
          data-testid={card.testId}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">{card.title}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
            </div>
            <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
              <i className={`${card.icon} ${card.iconColor} text-lg`}></i>
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            {card.change && (
              <>
                <span className="text-success font-medium">{card.change}</span>
                {card.changeText && (
                  <span className="text-secondary ml-1">{card.changeText}</span>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
