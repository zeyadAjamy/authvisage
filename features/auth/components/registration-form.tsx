"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { signUpWithEmailPassword } from "@/features/auth/services/api";
import { schema } from "@/features/auth/schemas/register";

export const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isPending, mutateAsync: signUpWithEmailPasswordTrigger } =
    useMutation({
      mutationKey: ["signUpWithEmailPassword"],
      mutationFn: signUpWithEmailPassword,
      onError: (error) => {
        const message = error.message || "Failed to create account";
        toast.error(message);
      },
      onSuccess: () => {
        toast.success("Account created successfully! Please check your email.");
      },
    });
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const { data: parseData, error } = schema.safeParse(data);

    if (error) {
      const firstErrorMessage = error.issues[0].message;
      toast.error(firstErrorMessage);
      return;
    }

    await signUpWithEmailPasswordTrigger(parseData);
  };

  return (
    <div className="relative z-10 mx-auto flex max-w-md min-w-0 flex-col gap-6 overflow-hidden p-1 md:min-w-[450px]">
      <div className="flex flex-col gap-2">
        <h1 className="text-center text-4xl font-bold">AuthVisage</h1>
        <p className="text-md text-center text-gray-500">
          Authentication made easy with face recognition
        </p>
      </div>
      <form
        onSubmit={handleRegister}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-3">
          <Input
            id="name"
            type="text"
            placeholder="Full Name"
            required
            name="fullname"
            autoComplete="fullname"
            className="rounded-lg border px-7 py-6 shadow-none"
          />
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="Email Address"
            required
            autoComplete="email"
            className="rounded-lg border p-1 px-7 py-6 shadow-none"
          />
          <div className="focus-within:ring-ring flex items-center justify-between gap-3 rounded-lg border p-1 px-4 focus-within:ring-2">
            <div className="flex w-full items-center gap-3">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Password"
                autoComplete="new-password"
                name="password"
                className="focus-visible:none border-none shadow-none focus-visible:ring-0 focus-visible:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeOff className="text-primary h-5 w-5" />
              ) : (
                <Eye className="text-primary h-5 w-5" />
              )}
            </button>
          </div>
          <div className="focus-within:ring-ring flex items-center justify-between gap-3 rounded-lg border p-1 px-4 focus-within:ring-2">
            <div className="flex w-full items-center gap-3">
              <Input
                id="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="Confirm Password"
                autoComplete="new-password"
                name="confirm_password"
                className="focus-visible:none border-none shadow-none focus-visible:ring-0 focus-visible:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
            >
              {showConfirmPassword ? (
                <EyeOff className="text-primary h-5 w-5" />
              ) : (
                <Eye className="text-primary h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="w-full p-6"
        >
          {isPending ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
      <div className="text-center text-sm">
        Already a member?
        <Link
          href="/login"
          className="text-primary ml-1 font-bold hover:underline"
        >
          Login
        </Link>
      </div>
    </div>
  );
};
