"use client";

import {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
} from "react";
import { getConnectedApps } from "@/features/connected-apps/services/api";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import type { ConnectedApp } from "@/features/connected-apps/types";

interface ConnectedAppsContextType {
  connectedApps: ConnectedApp[];
  filteredApps: ConnectedApp[];
  setFilteredApps: React.Dispatch<React.SetStateAction<ConnectedApp[]>>;
  isLoading: boolean;
  disconnectAppCallback: (appId: string) => void;
}

const ConnectedAppsContext = createContext({} as ConnectedAppsContextType);

export const ConnectedAppsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data, isLoading, error } = useQuery<ConnectedApp[]>({
    queryKey: ["connected-apps"],
    queryFn: getConnectedApps,
  });

  const [filteredApps, setFilteredApps] = useState<ConnectedApp[]>([]);

  const disconnectAppCallback = useCallback(
    (appId: string) => {
      setFilteredApps((prev) => prev.filter((app) => app.project.id !== appId));
    },
    [setFilteredApps],
  );
  // When the data is fetched, set the filteredApps to the connectedApps
  useEffect(() => {
    if (!data) return;
    setFilteredApps(data);
  }, [data]);

  // Handle error state
  useEffect(() => {
    if (!error) return;
    toast.error("Failed to fetch connected apps. Please try again later.");
  }, [error]);

  return (
    <ConnectedAppsContext.Provider
      value={{
        connectedApps: data || [],
        disconnectAppCallback,
        filteredApps,
        setFilteredApps,
        isLoading,
      }}
    >
      {children}
    </ConnectedAppsContext.Provider>
  );
};

export const useConnectedApps = () => {
  const context = useContext(ConnectedAppsContext);
  if (!context) {
    throw new Error(
      "useConnectedApps must be used within a ConnectedAppsProvider",
    );
  }
  return context;
};
