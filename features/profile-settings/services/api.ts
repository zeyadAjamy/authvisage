import { client } from "@/lib/supabase/config";
import { UpdateInfoScheme } from "@/features/profile-settings/schemes/update-info";
import { axiosInstance } from "@/lib/axios";

export const updateUserInfo = async (data: UpdateInfoScheme) => {
  client.auth.updateUser({
    email: data.email,
    data: {
      fullname: data.fullname,
      avatar_url: data.avatar,
    },
  });
};

export const updateUserPassword = async (newPassword: string) => {
  const { error } = await client.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const deleteUserAccount = async () => {
  const { data, status } = await axiosInstance.delete("/users/me");

  if (status !== 200) {
    throw new Error("Failed to delete user account");
  }

  return data;
};
