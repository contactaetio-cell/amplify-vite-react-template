import { useEffect, useState } from 'react';
import { LayoutDashboard, Upload, HelpCircle, Settings, PanelLeftClose, PanelLeft } from 'lucide-react';
import { cn } from '../components/ui/utils';
import { fetchUserAttributes } from "aws-amplify/auth";

interface SidebarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: LayoutDashboard },
  { id: 'ingestion', label: 'Add New Insights', icon: Upload },
  { id: 'help', label: 'Help', icon: HelpCircle },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export function Sidebar({ currentScreen, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [name, setName] = useState<string>("");
  const [picture, setPicture] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const attributes = await fetchUserAttributes();
        setName(attributes.given_name ?? attributes.email ?? "User");
        setPicture(attributes.picture ?? null);
      } catch (err) {
        console.error("Failed to fetch user attributes", err);
      }
    }

    loadUser();
  }, []);

  return (
    <aside
      className={cn(
        "bg-[#0f1f3a] flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center border-b border-[#234060]">
        <button
          onClick={() => onNavigate('home')}
          className={cn(
            "flex-1 text-left hover:bg-[#1a2f4d] transition-colors min-w-0",
            collapsed ? "p-4 flex items-center justify-center" : "p-6"
          )}
        >
          {collapsed ? (
            <span className="text-xl font-semibold text-white">A</span>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-white">Aetio</h1>
              <p className="text-sm text-[#6da3d8] mt-1">The Insights Marketplace</p>
            </>
          )}
        </button>
      </div>

      {/* Collapse Toggle */}
      <div className={cn("px-3 pt-3", collapsed ? "flex justify-center" : "flex justify-end")}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md text-[#6da3d8] hover:text-white hover:bg-[#1a2f4d] transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id ||
              (item.id === 'ingestion' && currentScreen === 'manual-entry');

            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "w-full flex items-center rounded-lg text-sm transition-colors",
                    collapsed
                      ? "justify-center px-0 py-3"
                      : "gap-3 px-4 py-3",
                    isActive
                      ? "bg-[#1a2f4d] text-white font-medium"
                      : "text-[#a8c9e8] hover:bg-[#1a2f4d] hover:text-white"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-[#234060]">
        <div
          className={cn(
            "flex items-center py-3",
            collapsed ? "justify-center px-0" : "gap-3 px-4"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-[#2d5073] flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
            JD
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{name}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
