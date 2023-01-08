import React, { FC, ReactNode } from "react";

export const Segment: FC<{ body: ReactNode; image: ReactNode }> = ({
  image,
  body,
}) => (
  <div className="flex flex-col gap-5 items-center px-3 w-full sm:flex-row sm:gap-10 sm:justify-center">
    {image}
    <div className="flex flex-col gap-5 items-center px-3 w-full max-w-lg">
      {body}
    </div>
  </div>
);
