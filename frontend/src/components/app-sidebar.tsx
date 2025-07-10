import * as React from "react"
import {
  Gem,
  BarChartIcon,
  LayoutDashboardIcon,
  UsersIcon,
  BadgeDollarSign,
  Pickaxe,
  Container,
  Store,
  Users,
  UserPlus,
  ClipboardMinus,
  FilePenLine,
  Cog
} from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {

  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Sales",
      url: "/sales",
      icon: BadgeDollarSign,
    },
    {
      title: "Layaway",
      url: "/layaway",
      icon: BarChartIcon,
    },
    {
      title: "Repair/Grill",
      url: "/repair",
      icon: Pickaxe,
    },
    {
      title: "Gold Buy",
      url: "/goldBuy",
      icon: Container,
    },
    {
      title: "Items",
      url: "/items",
      icon: UsersIcon,
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: Store,
    },
    {
      title: "Supplier",
      url: "/supplier",
      icon: Users,
    },
    {
      title: "Customer",
      url: "/customer",
      icon: UserPlus,
    },
    {
      title: "Employee",
      url: "/employee",
      icon: UsersIcon,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: ClipboardMinus,
    },
    {
      title: "Policy",
      url: "/policy",
      icon: FilePenLine,
    },
    {
      title: "Admin Config",
      url: "/admin",
      icon: Cog,
    },
  ],


 
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <Gem className="h-5 w-5" />
                <span className="text-base font-bold">A1 - JEWELERS</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser/>
      </SidebarFooter>
    </Sidebar>
  )
}
