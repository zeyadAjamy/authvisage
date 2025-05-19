import { ConnectedAppsProvider } from "@/features/connected-apps/contexts/connected-projects";
import { ConnectedAppsTable } from "@/features/connected-apps/components/table";
import { ConnectedAppsHeader } from "@/features/connected-apps/components/header";

const ConnectedAppsPage = () => (
  <ConnectedAppsProvider>
    <div className="flex h-full flex-col gap-4 overflow-hidden md:h-[calc(100vh-100px)]">
      <ConnectedAppsHeader />
      <ConnectedAppsTable />
    </div>
  </ConnectedAppsProvider>
);

export default ConnectedAppsPage;
