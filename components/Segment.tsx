import { FC, HTMLAttributes, ReactNode } from "react";

export const Segment: FC<{
	children?: ReactNode;
	className?: HTMLAttributes<HTMLElement>["className"];
	image?: ReactNode;
}> = ({ image, children, className = "" }) => (
	<section
		className={`flex flex-col gap-6 justify-evenly items-center py-16 px-10 even:mt-2 w-full even:bg-gray-100 ${className}`}
	>
		<div className="flex flex-col gap-5 items-center w-full md:flex-row md:gap-10 md:justify-center">
			{image}
			<div className="flex flex-col gap-5 items-center w-full max-w-2xl">
				{children}
			</div>
		</div>
	</section>
);
