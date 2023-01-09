import React, { FC, ReactNode } from "react";

export const Segment: FC<{ body: ReactNode; image: ReactNode }> = ({
  image,
  body,
}) => (
  <div className="flex flex-col gap-5 items-center px-3 w-full md:flex-row md:gap-10 md:justify-center">
    {image}
    <div className="flex flex-col gap-5 items-center px-3 w-full max-w-2xl">
      {body}
    </div>
  </div>
);
