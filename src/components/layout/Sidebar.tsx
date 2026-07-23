import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  ShoppingCart,
  CreditCard,
  Settings,
  LogOut,
  X,
  ImageIcon,
  Tag,
  Smartphone,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Megaphone,
  Globe,
  Wrench,
  MessageSquare,
  Mail,
  MapPin,
  Flame,
  Headphones,
  Shield,
  UserCog,
  Image,
  UsersRound,
  TrendingUp,
  Bell,
  Truck,
  MessageCircle,
  FileText,
  Star,
  Film,
  Store,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useLogoStore } from "../../store/logoStore";
import type { AdminPermission } from "../../types";
import logo from "../../assets/logo.png";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  permissionKey?: string;
}

interface MenuGroup {
  label: string;
  icon: React.ElementType;
  items: MenuItem[];
}

const menuGroups: (MenuItem | MenuGroup)[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", permissionKey: "dashboard" },
  {
    label: "Operations",
    icon: ClipboardList,
    items: [
      { icon: ShoppingCart, label: "Orders", path: "/orders", permissionKey: "orders" },
      { icon: CreditCard, label: "Payments", path: "/payments", permissionKey: "payments" },
      { icon: Users, label: "Users", path: "/users", permissionKey: "users" },
    ],
  },
  {
    label: "Marketing",
    icon: Megaphone,
    items: [
      { icon: ImageIcon, label: "Banners", path: "/banners", permissionKey: "banners" },
      { icon: Star, label: "Customer Reviews", path: "/customer-reviews", permissionKey: "customer-reviews" },
      { icon: Film, label: "Reels", path: "/reels", permissionKey: "reels" },
      { icon: Tag, label: "Coupons", path: "/coupons", permissionKey: "coupons" },
      { icon: Bell, label: "Notifications", path: "/notifications", permissionKey: "notifications" },
      { icon: MessageCircle, label: "Contact Submissions", path: "/contact-submissions", permissionKey: "contact-submissions" },
    ],
  },
  {
    label: "Website Management",
    icon: Globe,
    items: [
      { icon: Smartphone, label: "Home Screen", path: "/home-screen", permissionKey: "home-screen" },
      { icon: FolderTree, label: "Categories", path: "/categories", permissionKey: "categories" },
      { icon: FolderTree, label: "Subcategories", path: "/subcategories", permissionKey: "categories" },
      { icon: Package, label: "Products", path: "/products", permissionKey: "products" },
      { icon: FileText, label: "Static Pages", path: "/static-pages", permissionKey: "static-pages" },
      { icon: Store, label: "Store Locator", path: "/stores", permissionKey: "stores" },
    ],
  },
  {
    label: "System Management",
    icon: Wrench,
    items: [
      { icon: TrendingUp, label: "Gold Rate", path: "/gold-rate", permissionKey: "gold-rate" },
      { icon: Truck, label: "Shipping & Fees", path: "/system/charges", permissionKey: "system-charges" },
      { icon: MessageSquare, label: "SMS Config", path: "/system/sms", permissionKey: "system-sms" },
      { icon: Mail, label: "Email Config", path: "/system/email", permissionKey: "system-email" },
      { icon: CreditCard, label: "Payment Config", path: "/system/payment", permissionKey: "system-payment" },
      { icon: MapPin, label: "Google Maps", path: "/system/google-maps", permissionKey: "system-google-maps" },
      { icon: Flame, label: "Firebase", path: "/system/firebase", permissionKey: "system-firebase" },
      { icon: Headphones, label: "Support Config", path: "/system/support", permissionKey: "system-support" },
      { icon: Settings, label: "Settings", path: "/settings", permissionKey: "settings" },
    ],
  },
  {
    label: "Team & Assets",
    icon: UsersRound,
    items: [
      { icon: Image, label: "Logos", path: "/logos", permissionKey: "logos" },
      { icon: Shield, label: "Roles", path: "/roles", permissionKey: "roles" },
      { icon: UserCog, label: "Staff", path: "/staff", permissionKey: "staff" },
    ],
  },
];

const isGroup = (item: MenuItem | MenuGroup): item is MenuGroup => {
  return "items" in item;
};

function hasPermission(
  permissionKey: string | undefined,
  permissions: AdminPermission[] | undefined,
  isSuperAdmin: boolean
): boolean {
  if (isSuperAdmin) return true;
  if (!permissionKey || !permissions) return false;
  const perm = permissions.find((p) => p.module === permissionKey);
  if (!perm) return false;
  return perm.create || perm.read || perm.update || perm.delete;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout, admin } = useAuthStore();
  const primaryLogo = useLogoStore((s) => s.byType.primary?.imageUrl);
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "Operations",
    "Marketing",
    "Website Management",
    "System Management",
    "Team & Assets",
  ]);

  const isSuperAdmin = admin?.role === "superadmin";
  const permissions = admin?.permissions || admin?.roleId?.permissions;

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const isGroupActive = (group: MenuGroup) => {
    return group.items.some((item) => location.pathname.startsWith(item.path));
  };

  const filterItems = (items: MenuItem[]) =>
    items.filter((item) => hasPermission(item.permissionKey, permissions, isSuperAdmin));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0 flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="relative flex items-center justify-center h-16 px-6 border-b border-gray-800">
          <img src={primaryLogo || logo} alt="Swarnaz" className="h-10 w-auto" />
          <button
            onClick={onClose}
            className="absolute right-4 lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          {menuGroups.map((item) => {
            if (!isGroup(item)) {
              if (!hasPermission(item.permissionKey, permissions, isSuperAdmin)) return null;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
                    ${
                      isActive
                        ? "bg-[#B8860B] text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </NavLink>
              );
            }

            const visibleItems = filterItems(item.items);
            if (visibleItems.length === 0) return null;

            const expanded = expandedGroups.includes(item.label);
            const groupActive = isGroupActive(item);

            return (
              <div key={item.label} className="space-y-0.5">
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={`
                    flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
                    ${
                      groupActive
                        ? "text-[#d4a843] bg-gray-800/50"
                        : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                    }
                  `}
                >
                  <div className="flex items-center">
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </div>
                  {expanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {expanded && (
                  <div className="ml-4 space-y-0.5">
                    {visibleItems.map((subItem) => {
                      const isActive = location.pathname.startsWith(subItem.path);
                      return (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          onClick={onClose}
                          className={`
                            flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors
                            ${
                              isActive
                                ? "bg-[#B8860B] text-white"
                                : "text-gray-300 hover:bg-gray-800 hover:text-white"
                            }
                          `}
                        >
                          <subItem.icon className="w-4 h-4 mr-3" />
                          {subItem.label}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
