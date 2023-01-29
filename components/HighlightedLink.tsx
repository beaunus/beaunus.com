import Link from "next/link";
import React, { FC, ReactNode } from "react";

export const HighlightedLink: FC<{ children: ReactNode; href: string }> = ({
  href,
  children,
}) => (
  <Link
    className="hover:bg-cyan-100 border-b-2 border-b-cyan-100 transition duration-75 ease-in-out sm:whitespace-nowrap"
    href={href}
  >
    {children}
  </Link>
);
