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
import { validateOriginsUrl } from "@/features/projects/utils/validate-origins";
import { useTrustedOrigins } from "@/features/projects/hooks/use-trusted-origins";
import { TrustedOrigin } from "../../types";

type AddTrustedOriginDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (domains: TrustedOrigin[]) => void;
  projectId?: string;
  isControlledMode: boolean;
};

export const AddTrustedOriginDialog = ({
  open,
  onOpenChange,
  onSave,
  projectId,
  isControlledMode,
}: AddTrustedOriginDialogProps) => {
  const [newUrl, setNewUrl] = useState("");
  const [tempDomains, setTempDomains] = useState<{ url: string }[]>([]);

  // Add domain mutation
  const { addTrustedOriginMutation } = useTrustedOrigins();

  // Handle adding a temp domain
  const handleAddTempDomain = () => {
    if (!newUrl.trim()) return;
    if (tempDomains.some((domain) => domain.url === newUrl)) {
      toast.error("This URL is already in the list.");
      return;
    }
    const isValidUrl = validateOriginsUrl(newUrl);
    if (!isValidUrl) {
      toast.error("Invalid URL format. Please enter a valid URL.");
      return;
    }
    setTempDomains([...tempDomains, { url: newUrl }]);
    setNewUrl("");
  };

  // Handle removing a temp domain
  const handleRemoveTempDomain = (index: number) => {
    setTempDomains(tempDomains.filter((_, i) => i !== index));
  };

  // Handle saving all temp domains
  const handleSaveDomains = async () => {
    if (tempDomains.length === 0) {
      onOpenChange(false);
      return;
    }

    const trustedOriginUrls = tempDomains.map((domain) => domain.url);

    if (!isControlledMode && projectId) {
      // In uncontrolled mode with projectId, use the API
      const newTrustedOrigins = trustedOriginUrls.map(
        async (url) =>
          await addTrustedOriginMutation.mutateAsync(
            {
              projectId,
              name: url,
            },
            {
              onError: () => {
                toast.error(`Failed to add the following origin URL: ${url}`);
              },
            },
          ),
      );

      const results = await Promise.allSettled(newTrustedOrigins);
      const successfulUrls = results.filter(
        (result) => result.status === "fulfilled",
      );
      const failedUrls = results.filter(
        (result) => result.status === "rejected",
      );

      if (failedUrls.length > 0) {
        toast.error(
          `Failed to add the following origin URLs: ${failedUrls
            .map((result) => result.reason)
            .join(", ")}`,
        );
      }

      if (successfulUrls.length > 0) {
        onSave(successfulUrls.map((result) => result.value));
      }
      return;
    }

    // Pass the new domains to the parent component
    onSave(trustedOriginUrls.map((url) => ({ id: `local_${url}`, name: url })));
    setTempDomains([]);
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

          {tempDomains.length > 0 && (
            <div className="space-y-2 rounded-md border p-2">
              {tempDomains.map((domain, index) => (
                <div
                  key={index}
                  className="bg-muted/50 flex items-center justify-between rounded-md p-2"
                >
                  <span className="flex-1 truncate font-mono text-sm">
                    {domain.url}
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
            onClick={handleSaveDomains}
            className="w-full"
          >
            Save URLs
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
