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
import { loginSchema } from "@/features/auth/schemas/login";

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const { isPending, mutateAsync: signInWithEmailPasswordTrigger } =
    useMutation({
      mutationKey: ["signInWithEmailPassword"],
      mutationFn: signInWithEmailPassword,
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        router.push(process.env.NEXT_PUBLIC_AUTHORIZED_REDIRECT_PATH || "/");
      },
    });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const { data: parseData, error } = loginSchema.safeParse(data);

    if (error) {
      const firstErrorMessage = error.issues[0].message;
      toast.error(firstErrorMessage);
      return;
    }

    await signInWithEmailPasswordTrigger(parseData);
  };

  return (
    <div className="relative z-10 mx-auto flex w-full max-w-md min-w-0 flex-col gap-6 overflow-hidden p-1 md:min-w-[450px]">
      <div className="flex flex-col gap-2">
        <h1 className="text-center text-4xl font-bold">AuthVisage</h1>
        <p className="text-md text-center text-gray-500">
          Welcome back! Please login to continue.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <div className="focus-within:ring-ring flex items-center gap-3 rounded-lg border p-1 px-4 focus-within:ring-2">
          <UserRound className="h-5 w-5" />
          <Input
            id="email"
            type="email"
            placeholder="Email Address"
            autoComplete="email"
            aria-autocomplete="both"
            name="email"
            required
            className="focus-visible:none border-none shadow-none focus-visible:ring-0 focus-visible:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="focus-within:ring-ring flex items-center justify-between gap-3 rounded-lg border p-1 px-4 focus-within:ring-2">
            <div className="flex w-full items-center gap-3">
              <KeyRound className="h-5 w-5" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Password"
                autoComplete="current-password"
                aria-autocomplete="both"
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
        </div>
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
