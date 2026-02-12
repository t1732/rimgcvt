import { useEffect, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { Home, Image as ImageIcon, Settings } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type Page = "home" | "settings";

interface AppSidebarProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

export const AppSidebar = ({ onNavigate, currentPage }: AppSidebarProps) => {
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    getVersion().then(setVersion);
  }, []);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sushi-600 text-primary-foreground">
            <ImageIcon className="h-4 w-4" />
          </div>
          <span className="text-xl font-bold">IMGCVT</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => onNavigate("home")}
                isActive={currentPage === "home"}
              >
                <Home />
                <span>Home</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => onNavigate("settings")}
                isActive={currentPage === "settings"}
              >
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-4 text-xs text-muted-foreground font-medium opacity-50 border-t border-sidebar-border">
          v{version}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
