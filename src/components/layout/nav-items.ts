import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, ListChecks, UserCheck, Truck, Bell, History, User,
  ClipboardList, BarChart3, TrendingUp, Users, HeartHandshake, Building2, Settings, Home,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const VOLUNTEER_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/rescues", label: "Rescues", icon: ListChecks },
  { href: "/my-rescues", label: "My Rescues", icon: UserCheck },
  { href: "/transport", label: "Transport", icon: Truck },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/history", label: "History", icon: History },
  { href: "/profile", label: "Profile", icon: User },
];

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin/control-centre", label: "Control Centre", icon: ClipboardList },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/pilot-insights", label: "Pilot Insights", icon: TrendingUp },
  { href: "/admin/volunteers", label: "Volunteers", icon: Users },
  { href: "/admin/donors", label: "Donors", icon: HeartHandshake },
  { href: "/admin/transport-partners", label: "Transport Partners", icon: Truck },
  { href: "/admin/distribution-locations", label: "Distribution Locations", icon: Building2 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export const MOBILE_NAV: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/rescues", label: "Rescues", icon: ListChecks },
  { href: "/my-rescues", label: "My Rescue", icon: UserCheck },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];
