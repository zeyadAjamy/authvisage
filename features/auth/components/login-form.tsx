"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { signInWithEmailPassword } from "@/features/auth/services/api";
import {
  loginSchema,
  type LoginSchemaType,
} from "@/features/auth/schemas/login";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const { isPending, mutateAsync: signInWithEmailPasswordTrigger } =
    useMutation({
      mutationFn: signInWithEmailPassword,
    });

  const handleSubmit = async (data: LoginSchemaType) => {
    await signInWithEmailPasswordTrigger(data, {
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        router.push(process.env.NEXT_PUBLIC_AUTHORIZED_REDIRECT_PATH || "/");
      },
    });
  };

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <div className="relative z-10 mx-auto flex w-full max-w-md min-w-auto flex-col gap-6 overflow-hidden p-1 md:min-w-[450px]">
      <div className="flex flex-col gap-2">
        <h1 className="text-center text-4xl font-bold">AuthVisage</h1>
        <p className="text-md text-center text-gray-500">
          Welcome back! Please login to continue.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="focus-within:ring-ring flex items-center gap-3 rounded-lg border p-1 px-4 focus-within:ring-2">
                  <UserRound className="h-5 w-5" />
                  <Input
                    {...field}
                    type="email"
                    placeholder="Email Address"
                    autoComplete="email"
                    required
                    className="focus-visible:none border-none shadow-none focus-visible:ring-0 focus-visible:outline-none"
                  />
                </div>
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
                    <KeyRound className="h-5 w-5" />
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      autoComplete="current-password"
                      required
                      className="focus-visible:none border-none shadow-none focus-visible:ring-0 focus-visible:outline-none"
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    type="button"
                    onClick={togglePasswordVisibility}
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
          <Link
            href="/reset-password"
            className="-mt-2 mb-1 w-full self-end text-right text-sm hover:underline"
          >
            Forgot Password?
          </Link>
          <Button
            type="submit"
            disabled={isPending}
            className="min-h-10 w-full cursor-pointer"
          >
            {isPending ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        <span>Don't have an account?</span>
        <Link
          href="/register"
          className="text-primary ml-1 font-semibold hover:underline"
        >
          Register
        </Link>
      </div>
    </div>
  );
};
