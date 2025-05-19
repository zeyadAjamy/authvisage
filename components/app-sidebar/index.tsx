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
import { SettingsIcon, LockIcon, ScanFaceIcon } from "lucide-react";

const navMenu = [
  {
    title: "Connected Apps",
    url: "/connected-apps",
    isActive: true,
    icon: LockIcon,
    items: [],
  },
  {
    title: "Projects",
    url: "/projects",
    icon: ScanFaceIcon,
    isActive: true,
    items: [
      {
        title: "Create New Project",
        url: "/projects/new",
      },
      {
        title: "Manage Projects",
        url: "/projects",
      },
    ],
  },
  {
    title: "Profile Settings",
    url: "/profile",
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
