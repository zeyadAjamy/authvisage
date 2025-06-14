"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { signUpWithEmailPassword } from "@/features/auth/services/api";
import {
  registrationSchema,
  type RegistrationFormSchema,
} from "@/features/auth/schemas/register";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";

export const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isPending, mutateAsync: signUpWithEmailPasswordTrigger } =
    useMutation({
      mutationFn: signUpWithEmailPassword,
    });
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleRegister = async (data: RegistrationFormSchema) => {
    await signUpWithEmailPasswordTrigger(data, {
      onError: (error) => {
        const message = error.message || "Failed to create account";
        toast.error(message);
      },
      onSuccess: () => {
        toast.success("Account created successfully! Please check your email.");
      },
    });
  };

  const form = useForm<RegistrationFormSchema>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullname: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  return (
    <div className="relative z-10 mx-auto flex max-w-md min-w-0 flex-col gap-6 overflow-hidden p-1 md:min-w-[450px]">
      <div className="flex flex-col gap-2">
        <h1 className="text-center text-4xl font-bold">AuthVisage</h1>
        <p className="text-md text-center text-gray-500">
          Authentication made easy with face recognition
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleRegister)}
          noValidate
          className="flex flex-col gap-4"
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Full Name"
                    required
                    autoComplete="fullname"
                    className="rounded-lg border px-7 py-[22px] shadow-none"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Email Address"
                    required
                    autoComplete="email"
                    className="rounded-lg border px-7 py-[22px] shadow-none"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="focus-within:ring-ring flex items-center justify-between gap-3 rounded-lg border p-1 px-4 focus-within:ring-2">
                    <div className="flex w-full items-center gap-3">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        autoComplete="current-password"
                        required
                        className="focus-visible:none border-none py-0 shadow-none focus-visible:ring-0 focus-visible:outline-none"
                      />
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={togglePasswordVisibility}
                      type="button"
                    >
                      {showPassword ? (
                        <EyeOff className="text-primary h-5 w-5" />
                      ) : (
                        <Eye className="text-primary h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <div className="focus-within:ring-ring flex items-center justify-between gap-3 rounded-lg border p-1 px-4 focus-within:ring-2">
                    <div className="-py-1 flex w-full items-center">
                      <Input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        autoComplete="current-password"
                        required
                        className="focus-visible:none border-none shadow-none focus-visible:ring-0 focus-visible:outline-none"
                      />
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={toggleConfirmPasswordVisibility}
                      type="button"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="text-primary h-5 w-5" />
                      ) : (
                        <Eye className="text-primary h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full py-5"
          >
            {isPending ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </Form>
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
