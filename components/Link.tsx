import React, { FC, ReactNode } from "react";

export const Link: FC<{ href: string; label: ReactNode }> = ({
  href,
  label,
}) => (
  <a
    className="hover:bg-cyan-100 border-b-2 border-b-cyan-100 transition duration-75 ease-in-out"
    href={href}
  >
    {label}
  </a>
);
