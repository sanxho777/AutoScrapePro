import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: "fas fa-tachometer-alt", current: true },
  { name: "Web Scraper", href: "/scraper", icon: "fas fa-spider", current: false },
  { name: "Inventory", href: "/inventory", icon: "fas fa-car-side", current: false, count: 247 },
  { name: "Facebook Groups", href: "/facebook", icon: "fab fa-facebook", current: false },
  { name: "Analytics", href: "/analytics", icon: "fas fa-chart-line", current: false },
  { name: "Settings", href: "/settings", icon: "fas fa-cog", current: false },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-car text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">VinScraper</h1>
            <p className="text-sm text-secondary">Pro</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4" data-testid="sidebar-navigation">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  location === item.href
                    ? "bg-primary text-white"
                    : "text-slate-700 hover:bg-slate-100"
                )}
                data-testid={`nav-link-${item.name.toLowerCase().replace(' ', '-')}`}
              >
                <i className={`${item.icon} w-5`}></i>
                <span>{item.name}</span>
                {item.count && (
                  <span className="ml-auto bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full">
                    {item.count}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Extension Status */}
      <div className="p-4 border-t border-slate-200">
        <div className="bg-success/10 border border-success/20 rounded-lg p-3" data-testid="extension-status">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-sm font-medium text-success">Extension Connected</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">Chrome extension active</p>
        </div>
      </div>
    </div>
  );
}
