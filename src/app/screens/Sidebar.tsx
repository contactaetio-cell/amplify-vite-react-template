import { useState } from 'react';
import { LayoutDashboard, Upload, Search, Settings, HelpCircle, PanelLeftClose, PanelLeftOpen, LogOut } from 'lucide-react';
import { cn } from '../components/ui/utils';
import { Logo } from '../components/Logo';

interface SidebarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: LayoutDashboard },
  { id: 'ingestion', label: 'Add New Insights', icon: Upload },
  { id: 'discovery', label: 'Discover Insights', icon: Search },
  { id: 'help', label: 'Help', icon: HelpCircle },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export function Sidebar({ currentScreen, onNavigate, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const ingestionScreens = ['manual-entry', 'upload', 'extraction', 'structuring', 'validation', 'publish'];

  return (
    <aside
      className={cn(
        'border-r border-gray-200 bg-white flex flex-col transition-all duration-200',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="border-b border-gray-200 flex">
        <button
          className={cn(
            'flex-1 hover:bg-gray-50 transition-colors',
            isCollapsed ? 'p-4' : 'p-6 text-left'
          )}
          onClick={() => onNavigate('home')}
        >
          <div className={cn('flex items-center', isCollapsed ? 'justify-center' : 'gap-2')}>
            <Logo variant="icon" className="h-6 w-6" />
            {!isCollapsed && <span className="text-lg font-semibold tracking-tight text-gray-900">Aetio</span>}
          </div>
          {!isCollapsed && <p className="text-sm text-gray-500 mt-1">The Insights Marketplace</p>}
        </button>

        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className={cn(
            'border-l border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center',
            isCollapsed ? 'w-8' : 'w-10'
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>
      
      <nav className={cn('flex-1', isCollapsed ? 'p-2' : 'p-4')}>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id || 
              (item.id === 'ingestion' && ingestionScreens.includes(currentScreen));
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    'w-full rounded-lg transition-colors',
                    isCollapsed ? 'flex justify-center p-3' : 'flex items-center gap-3 px-4 py-3 text-sm',
                    isActive 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5" />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className={cn('border-t border-gray-200', isCollapsed ? 'p-2' : 'p-4')}>
        <div className={cn(isCollapsed ? 'flex justify-center py-2' : 'flex items-center gap-3 px-4 py-3')}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
            JD
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
              <p className="text-xs text-gray-500 truncate">Product Manager</p>
            </div>
          )}
        </div>

        <div
          onClick={onLogout}
          className={cn(
            'mt-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer',
            isCollapsed ? 'flex justify-center p-3' : 'flex items-center gap-2 px-4 py-3 text-sm font-medium'
          )}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onLogout();
            }
          }}
          title={isCollapsed ? 'Log Out' : undefined}
          aria-label="Log Out"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Log Out</span>}
        </div>
      </div>
    </aside>
  );
}
