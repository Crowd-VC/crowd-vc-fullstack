'use client';

import cn from "@/utils/cn";
import { ClassicHeader } from "@/layouts/header/header";
import Sidebar from "@/layouts/sidebar/_expandable";
import { SecondaryHeader } from "@/layouts/header/secondary-header";
import { Separator } from "@/components/ui/separator";
import { RootProvider } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

export default function ClassicLayout({
	children,
	contentClassName,
}: React.PropsWithChildren<{ contentClassName?: string }>) {
	return (
		<div className="ltr:xl:pl-24 rtl:xl:pr-24 ltr:2xl:pl-28 rtl:2xl:pr-28 ">
			<RootProvider>
				<ClassicHeader />
				<SecondaryHeader />
				<Separator className="mt-2" />
				<Sidebar className="hidden xl:block" />
				<main
					className={cn(
						"min-h-screen px-4 pb-16 pt-4 sm:px-6 sm:pb-20 lg:px-8 xl:pb-24 xl:pt-5 3xl:px-10",
						contentClassName,
					)}
				>
					{children}
				</main>
				<Toaster />
			</RootProvider>
		</div>
	);
}
