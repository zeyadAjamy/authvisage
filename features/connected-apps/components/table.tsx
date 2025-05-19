"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useConnectedApps } from "@/features/connected-apps/contexts/connected-projects";
import { ConnectedAppRow } from "./table-row";
import { ConnectedAppsPaginator } from "./paginator";

export const ConnectedAppsTable = () => {
  const { filteredApps, isLoading } = useConnectedApps();
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="relative flex h-full flex-col gap-4 overflow-hidden">
      <Table className="relative overflow-x-auto rounded-md">
        <TableHeader className="bg-background sticky top-0 z-10">
          <TableRow>
            <TableHead className="z-10 min-w-[200px]">App</TableHead>
            <TableHead className="min-w-[150px]">Connected At</TableHead>
            <TableHead className="min-w-[150px]">Last Sign-in</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="h-full overflow-y-auto">
          {filteredApps.length === 0 ? (
            <TableRow className="max-h-20">
              <TableCell
                colSpan={4}
                className="text-muted-foreground h-24 text-center"
              >
                {isLoading ? "Loading..." : "No connected apps found."}
              </TableCell>
            </TableRow>
          ) : (
            filteredApps
              .slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage,
              )
              .map((app) => (
                <ConnectedAppRow
                  key={app.id}
                  {...app}
                />
              ))
          )}
        </TableBody>
      </Table>
      <ConnectedAppsPaginator
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={setItemsPerPage}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
      />
    </div>
  );
};
