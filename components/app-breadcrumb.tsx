"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { HomeIcon } from "lucide-react";
import { usePathname } from "next/navigation";

export const AppBreadcrumb = () => {
  const pathSegments = usePathname()
    .split("/")
    .filter((p) => p);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="#">
            <HomeIcon size={18} />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        {pathSegments.map((segment, index) => {
          const breadcrumbUrl = `/${pathSegments
            .slice(0, index + 1)
            .join("/")}`;

          return (
            <div
              key={index}
              className="flex items-center gap-2"
            >
              <BreadcrumbItem key={breadcrumbUrl}>
                <BreadcrumbLink
                  href={breadcrumbUrl}
                  className="first-letter:uppercase"
                >
                  {segment}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {index < pathSegments.length - 1 && (
                <BreadcrumbSeparator className="hidden md:block" />
              )}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
