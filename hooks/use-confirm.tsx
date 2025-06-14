"use client";

import { useState, useCallback, useMemo, JSX } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Confirm {
  title: string;
  message: string;
}

interface UseConfirm {
  /**
   * A component that renders the confirmation dialog.
   * @returns {JSX.Element} The confirmation dialog component.
   */
  ConfirmDialog: () => JSX.Element;

  /**
   * Displays the confirmation dialog and returns a promise
   * that resolves to a boolean based on the user's choice.
   *
   * @param {Confirm} confirm - The confirmation object containing the message.
   * @returns {Promise<boolean>} A promise that resolves to `true` if the user confirms, otherwise `false`.
   */
  askForConfirmation: (confirm: Confirm) => Promise<boolean>;
}

interface ConfirmDialogProps {
  /** Whether the dialog is open or not */
  isOpen: boolean;

  /** The confirmation object containing the message */
  confirmObject: Confirm | null;

  /** Function to close the dialog */
  close: () => void;

  /** Callback function triggered when the user agrees or cancels */
  onAgree: () => void;
}

/**
 * Component that renders the confirmation dialog UI.
 *
 * @param {ConfirmDialogProps} props - Props for the dialog component.
 * @returns {JSX.Element | null} The rendered dialog or null if no confirmation object is present.
 */
const ConfirmDialog = ({
  isOpen,
  confirmObject,
  close,
  onAgree,
}: ConfirmDialogProps): JSX.Element | null => {
  if (!confirmObject) return null;

  const { title, message } = confirmObject;

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close(); // This handles ESC key and clicks outside
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={close}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onAgree}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

/**
 * Custom hook that provides confirmation dialog functionality.
 *
 * @returns {UseConfirm} An object containing the `ConfirmDialog` component and the `askForConfirmation` function.
 * @example
 * const MyComponent = () => {
 *   const { ConfirmDialog, askForConfirmation } = useConfirm();
 *
 *   const handleDelete = async () => {
 *     const confirmed = await askForConfirmation({
 *       message: "Are you sure you want to delete this item?",
 *     });
 *     if (confirmed) {
 *       // Perform delete action
 *       console.log("Item deleted!");
 *     } else {
 *       console.log("Action canceled");
 *     }
 *   };
 *
 *   return (
 *     <Box>
 *       <Button onClick={handleDelete}>Delete</Button>
 *       <ConfirmDialog />
 *     </Box>
 *   );
 * };
 */
export const useConfirm = (): UseConfirm => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [resolvePromise, setResolvePromise] = useState<
    ((agree: boolean) => void) | null
  >(null);

  const askForConfirmation = useCallback(
    async (confirm: Confirm): Promise<boolean> => {
      await new Promise((resolve) => setTimeout(resolve, 50));

      setConfirm(confirm);
      setIsOpen(true);

      return new Promise<boolean>((resolve) => {
        setResolvePromise(() => resolve);
      });
    },
    [],
  );

  const close = useCallback(() => {
    // Important: resolve the promise as FALSE when closing without explicit agreement
    if (resolvePromise) {
      resolvePromise(false);
    }

    // First close the dialog visually to improve perceived performance
    setIsOpen(false);

    // Then clean up state with a slight delay to avoid race conditions
    setTimeout(() => {
      setConfirm(null);
      setResolvePromise(null); // Clear the resolver to avoid memory leaks
    }, 10);
  }, [resolvePromise]);

  const handleAgree = useCallback(() => {
    // Store locally to avoid race conditions
    const resolver = resolvePromise;

    // Clean up state first
    setResolvePromise(null);

    // Resolve as true for agreement
    if (resolver) {
      resolver(true);
    }

    // Close the dialog
    setIsOpen(false);

    // Clean up remaining state with slight delay
    setTimeout(() => {
      setConfirm(null);
    }, 10);
  }, [resolvePromise]);

  const ConfirmDialogComponent = useMemo(
    () => (
      <ConfirmDialog
        isOpen={isOpen}
        confirmObject={confirm}
        close={close}
        onAgree={handleAgree}
      />
    ),
    [isOpen, confirm, close, handleAgree],
  );

  return {
    ConfirmDialog: () => ConfirmDialogComponent,
    askForConfirmation,
  };
};
