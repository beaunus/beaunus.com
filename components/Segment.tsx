import React, { FC, ReactNode } from "react";

export const Segment: FC<{ body: ReactNode; image?: ReactNode }> = ({
  image,
  body,
}) => (
  <section className="flex flex-col gap-6 justify-evenly items-center py-16 px-5 even:mt-2 w-full even:bg-gray-100">
    <div className="flex flex-col gap-5 items-center px-3 w-full md:flex-row md:gap-10 md:justify-center">
      {image}
      <div className="flex flex-col gap-5 items-center px-3 w-full max-w-2xl">
        {body}
      </div>
    </div>
  </section>
);
