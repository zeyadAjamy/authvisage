"use client";

import { CreateProjectButton } from "./create-project-button";
import { ConnectedAppsFilters } from "./filters";

export const ConnectedAppsHeader = () => {
  return (
    <div className="bg-card flex flex-col items-start gap-4 rounded-lg border p-10 px-6 md:items-end xl:flex-row">
      <div className="flex w-full flex-col overflow-hidden rounded-md">
        <h1 className="text-2xl font-bold md:text-3xl">Connected Apps</h1>
        <p className="text-muted-foreground text-lg">
          Manage your connected applications and their permissions.
        </p>
      </div>
      <div className="flex w-full flex-col items-center gap-2 md:flex-row xl:w-fit">
        <ConnectedAppsFilters />
        <CreateProjectButton />
      </div>
    </div>
  );
};
