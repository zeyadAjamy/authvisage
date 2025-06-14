"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadMedia } from "@/components/upload-media";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  updateInfoSchema,
  type UpdateInfoScheme,
} from "@/features/profile-settings/schemes/update-info";
import { updateUserInfo } from "@/features/profile-settings/services/api";
import { useMutation } from "@tanstack/react-query";
import { useMedia } from "@/hooks/use-media";
import { StorageBucket } from "@/lib/supabase/storage";
import { User } from "@/types/user";

interface UpdateUserInfoProps {
  user?: User | null;
}

export const UpdateUserInfo = ({ user }: UpdateUserInfoProps) => {
  const form = useForm<UpdateInfoScheme>({
    resolver: zodResolver(updateInfoSchema),
    defaultValues: {
      fullname: user?.name,
      email: user?.email,
      avatar: user?.avatar,
    },
  });

  const { uploadMediaMutation, deleteMediaMutation, getPublicUrlMutation } =
    useMedia(StorageBucket.AVATARS);

  const updateUserInfoMutation = useMutation({
    mutationFn: updateUserInfo,
  });

  const handleUserMediaChange = async (file?: File | null | string) => {
    if (typeof file === "string") {
      return file;
    }

    // Delete previous media if exists
    if (user?.avatar) {
      const path = new URL(user?.avatar || "", window.location.origin).pathname
        .split("/")
        .pop();
      if (path) {
        await deleteMediaMutation.mutateAsync(path, {
          onError: (error) => {
            toast.error("Failed to delete previous profile picture.");
            console.error("Error deleting previous media:", error);
          },
        });
      }
    }

    if (!file) {
      return null;
    }

    const newAvatarPathObject = await uploadMediaMutation.mutateAsync(file, {
      onError: (error) => {
        toast.error("Failed to upload profile picture.");
        console.error("Error uploading media:", error);
      },
    });

    const publicUrl = getPublicUrlMutation.mutateAsync(
      newAvatarPathObject.path,
      {
        onError: (error) => {
          toast.error("Failed to get public URL for profile picture.");
          console.error("Error getting public URL:", error);
        },
      },
    );

    return publicUrl;
  };

  const onSubmit = async (data: UpdateInfoScheme) => {
    const newUserData = { ...data };

    const avatarUrl = await handleUserMediaChange(data.avatar);
    if (avatarUrl) {
      newUserData.avatar = avatarUrl;
    }

    // Call the API to update user information
    updateUserInfoMutation.mutateAsync(newUserData, {
      onSuccess: () => {
        toast.success("Profile updated successfully.");
      },
      onError: (error) => {
        toast.error("Failed to update profile.");
        console.error("Error updating profile:", error);
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-card flex flex-col gap-4 rounded-md border p-6"
      >
        <div className="mb-2">
          <h3 className="text-lg font-semibold">Profile Information</h3>
          <p className="text-muted-foreground text-sm">
            Update your profile picture, name, and email address.
          </p>
        </div>

        <FormField
          control={form.control}
          name="avatar"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <FormLabel className="font-medium">Profile Picture</FormLabel>
              <UploadMedia
                media={field.value}
                acceptList={["image"]}
                setMedia={(file) => field.onChange(file)}
                allowFullScreen
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fullname"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <FormLabel className="font-medium">Full Name</FormLabel>
              <Input
                placeholder="Enter your full name"
                className="py-5"
                {...field}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <FormLabel className="font-medium">Email Address</FormLabel>
              <Input
                type="email"
                placeholder="Enter your email address"
                className="py-5"
                {...field}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-fit gap-2 self-end"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Profile"
          )}
        </Button>
      </form>
    </Form>
  );
};
