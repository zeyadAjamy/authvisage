"use client";

import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { deleteUserAccount } from "@/features/profile-settings/services/api";
import { useMutation } from "@tanstack/react-query";
import { signOut } from "@/features/auth/services/api";

export const DeleteUserAccount = () => {
  const { ConfirmDialog, askForConfirmation } = useConfirm();
  const deleteUserMutation = useMutation({
    mutationFn: deleteUserAccount,
    onSuccess: () => {
      toast.success(
        "Account deleted successfully. You will be redirected shortly.",
      );
      signOut();
    },
    onError: (error) => {
      toast.error(
        "Failed to delete account. Please try again or contact support.",
      );
      console.error("Error deleting account:", error);
    },
  });
  const handleDeleteAccount = async () => {
    const confirmed = await askForConfirmation({
      title: "Delete Account",
      message:
        "Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently remove all your data, projects, and settings.",
    });

    if (!confirmed) return;
    await deleteUserMutation.mutateAsync();
  };

  return (
    <>
      <div className="bg-card flex flex-col gap-4 rounded-md border border-red-200 p-6 dark:border-red-800">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
            Delete Account
          </h3>
          <p className="text-muted-foreground text-sm">
            Permanently remove your account and all associated data.
          </p>
        </div>

        <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div className="text-sm">
              <p className="mb-2 font-medium text-red-800 dark:text-red-200">
                Warning: This action is irreversible
              </p>
              <ul className="list-inside list-disc space-y-1 text-red-700 dark:text-red-300">
                <li>All your personal data will be permanently deleted</li>
                <li>Your projects and files will be removed</li>
                <li>Your account settings and preferences will be lost</li>
                <li>You will lose access to all premium features</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>
          </div>
        </div>

        {/* <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Before deleting:</strong> Make sure to download any
            important data or transfer ownership of shared projects to other
            team members.
          </p>
        </div> */}

        <Button
          variant="destructive"
          onClick={handleDeleteAccount}
          disabled={deleteUserMutation.isPending}
          className="w-fit gap-2 self-end"
        >
          {deleteUserMutation.isPending ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Deleting Account...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Delete Account
            </>
          )}
        </Button>
      </div>
      <ConfirmDialog />
    </>
  );
};
