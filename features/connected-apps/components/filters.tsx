"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useConnectedApps } from "@/features/connected-apps/contexts/connected-projects";

export const ConnectedAppsFilters = () => {
  const { setFilteredApps, connectedApps } = useConnectedApps();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === "") {
      setFilteredApps(connectedApps); // Reset to original list if search is cleared
      return;
    }

    const searchTerm = event.target.value.toLowerCase();
    const filtered = connectedApps.filter((app) =>
      app.name.toLowerCase().includes(searchTerm),
    );
    setFilteredApps(filtered);
  };

  return (
    <div className="relative flex w-full items-center md:w-[300px]">
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
      <Input
        placeholder="Search projects..."
        onChange={handleSearchChange}
        className="py-5 pl-9"
      />
    </div>
  );
};
