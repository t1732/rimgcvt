import { useState } from "react";

import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { HomePage } from "@/pages/HomePage";
import { SettingsPage } from "@/pages/SettingsPage";

type Page = "home" | "settings";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  return (
    <SettingsProvider>
      <ThemeProvider>
        <SidebarProvider>
          <AppSidebar onNavigate={setCurrentPage} currentPage={currentPage} />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Header />
            </header>
            <main>
              {currentPage === "home" && <HomePage />}
              {currentPage === "settings" && <SettingsPage />}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}

export default App;
