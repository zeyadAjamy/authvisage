import "./globals.css";
import { Bounce, ToastContainer } from "react-toastify";
import { ReactQueryProviders } from "@/contexts/react-query";
import { UserProvider } from "@/contexts/user";
import { Suspense } from "react";
import { LoadingPage } from "@/components/loading-page";
import { ThemeProvider } from "@/contexts/theme";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AuthVisage",
  description: "A face authentication system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark"
      style={{ colorScheme: "dark" }}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={<LoadingPage />}>
            <ReactQueryProviders>
              <UserProvider>{children}</UserProvider>
            </ReactQueryProviders>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick={false}
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              transition={Bounce}
            />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
