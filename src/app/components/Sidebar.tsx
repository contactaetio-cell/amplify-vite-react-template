import { LayoutDashboard, Upload, Library, Search, Settings, HelpCircle } from 'lucide-react';
import { cn } from './ui/utils';

interface SidebarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: LayoutDashboard },
  { id: 'ingestion', label: 'Add New Insights', icon: Upload },
  { id: 'discovery', label: 'Discover Insights', icon: Search },
  { id: 'help', label: 'Help', icon: HelpCircle },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export function Sidebar({ currentScreen, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col">
      <button 
        onClick={() => onNavigate('home')}
        className="p-6 border-b border-gray-200 text-left hover:bg-gray-50 transition-colors"
      >
        <h1 className="text-xl font-semibold text-gray-900">Aetio</h1>
        <p className="text-sm text-gray-500 mt-1">The Insights Marketplace</p>
      </button>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id || 
              (item.id === 'ingestion' && currentScreen === 'manual-entry');
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors",
                    isActive 
                      ? "bg-blue-50 text-blue-700 font-medium" 
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
            <p className="text-xs text-gray-500 truncate">Product Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
}