import { useLocation, NavLink } from "react-router-dom";
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

export function NavMain({ items }: { items: NavItem[] }) {
  const location = useLocation();

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = location.pathname.startsWith(item.url);

        return (
          <SidebarMenuItem key={item.title}>
            <NavLink
              to={item.url}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md transition-colors w-full",
                isActive ? "bg-primary text-white" : "hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </NavLink>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
