"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMenu } from "./nav-menu";
import { NavUser } from "./nav-user";
import { SettingsIcon, LockIcon } from "lucide-react";

const navMenu = [
  {
    title: "Connected Apps",
    url: "/connected-apps",
    isActive: true,
    icon: LockIcon,
    items: [],
  },
  {
    title: "Profile Settings",
    url: "/profile-settings",
    icon: SettingsIcon,
    items: [],
  },
];

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <NavUser />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMenu items={navMenu} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
};
