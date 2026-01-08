"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";

const links = [
  {
    label: "form builder",
    href: "/",
  },
  {
    label: "Summary table data",
    href: "/summary",
  },
  {
    label: "Review",
    href: "/review",
  },
];

export function Header() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;
  return (
    <header className="bg-background">
      <div className="p-4 flex items-center space-x-4 justify-center border-b border-gray-200">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-sm font-medium hover:text-primary ",
              isActive(link.href) ? "text-primary " : "text-gray-500"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
