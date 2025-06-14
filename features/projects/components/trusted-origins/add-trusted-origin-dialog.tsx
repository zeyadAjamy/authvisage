"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { urlScheme } from "@/features/projects/schemes/url-scheme";

type AddTrustedOriginDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (origins: string[]) => void;
};

export const AddTrustedOriginDialog = ({
  open,
  onOpenChange,
  onSave,
}: AddTrustedOriginDialogProps) => {
  const [newUrl, setNewUrl] = useState("");
  const [tempOrigins, setTempOrigins] = useState<string[]>([]);

  // Handle adding a temp domain
  const handleAddTempDomain = () => {
    if (!newUrl.trim()) return;
    if (tempOrigins.includes(newUrl)) {
      toast.error("This URL is already in the list.");
      return;
    }
    // Validate the URL format
    const isValidUrl = urlScheme.safeParse({ url: newUrl });
    if (!isValidUrl.success) {
      toast.error("Invalid URL format. Please enter a valid URL.");
      return;
    }

    setTempOrigins([...tempOrigins, newUrl]);
    setNewUrl("");
  };

  // Handle removing a temp domain
  const handleRemoveTempDomain = (index: number) => {
    setTempOrigins(tempOrigins.filter((_, i) => i !== index));
  };

  // Handle saving all temp domains
  const handleSaveOrigins = async () => {
    if (tempOrigins.length === 0) {
      onOpenChange(false);
      return;
    }
    onSave(tempOrigins);
    setTempOrigins([]);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add new redirect URLs</DialogTitle>
          <DialogDescription>
            This will add a URL to a list of allowed URLs that can interact with
            your Authentication services for this project.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label
                  htmlFor="url"
                  className="mb-1 block text-sm font-medium"
                >
                  URL
                </label>
                <Input
                  id="url"
                  placeholder="https://mydomain.com"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTempDomain();
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                onClick={handleAddTempDomain}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Add URL
              </Button>
            </div>
          </div>

          {tempOrigins.length > 0 && (
            <div className="space-y-2 rounded-md border p-2">
              {tempOrigins.map((origin, index) => (
                <div
                  key={index}
                  className="bg-muted/50 flex items-center justify-between rounded-md p-2"
                >
                  <span className="flex-1 truncate font-mono text-sm">
                    {origin}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveTempDomain(index)}
                    className="h-6 w-6"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleSaveOrigins}
            className="w-full"
          >
            Save URLs
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
