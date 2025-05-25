"use client";

import { UpdateUserInfo } from "@/features/profile-settings/components/update-user-info";
import { UpdateUserPassword } from "@/features/profile-settings/components/update-user-password";
import { DeleteUserAccount } from "@/features/profile-settings/components/delete-user-account";
import { useUserContext } from "@/contexts/user";

const ProfileSettingsPage = () => {
  const { user } = useUserContext();

  return (
    <div className="flex w-full flex-col items-start justify-start gap-6">
      <div className="bg-card flex w-full flex-col overflow-hidden rounded-md border p-10 px-6">
        <h1 className="text-2xl font-bold md:text-3xl">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 items-start gap-6 md:grid-cols-2">
        <UpdateUserInfo user={user} />
        <div className="flex flex-col gap-6">
          <UpdateUserPassword />
          <DeleteUserAccount />
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
