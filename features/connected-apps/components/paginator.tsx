"use client";

import { useConnectedApps } from "@/features/connected-apps/contexts/connected-projects";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface ConnectedAppsPaginatorProps {
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setItemsPerPage: React.Dispatch<React.SetStateAction<number>>;
}

export const ConnectedAppsPaginator: React.FC<ConnectedAppsPaginatorProps> = ({
  itemsPerPage,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
  setCurrentPage,
  setItemsPerPage,
}) => {
  const { filteredApps } = useConnectedApps();

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Handle page changes
  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    onPageChange(Math.min(currentPage + 1, totalPages));
  };
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    onPageChange(Math.max(currentPage - 1, 1));
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    onItemsPerPageChange(Number(value));
    onPageChange(1);
  };

  return (
    <div>
      {filteredApps.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Showing {indexOfFirstItem + 1}-
            {Math.min(indexOfLastItem, filteredApps.length)} of{" "}
            {filteredApps.length} projects
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Rows per page</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={itemsPerPage.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              <div className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
