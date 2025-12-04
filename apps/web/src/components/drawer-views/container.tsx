"use client";

import { Fragment, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname, useSearchParams } from "next/navigation";
import { Dialog, Transition } from "@headlessui/react";
import { type DRAWER_VIEW, useDrawer } from "@/components/drawer-views/context";
import { useLayout } from "@/lib/hooks/use-layout";
import { LAYOUT_OPTIONS } from "@/lib/constants";
import { defaultMenuItems } from "@/layouts/sidebar/_menu-items";
import { Close } from "../icons/close";

// dynamic imports
const Sidebar = dynamic(() => import("@/layouts/sidebar/_default"));
const DrawerFilters = dynamic(() => import("@/components/search/filters"));
const DrawerMenu = dynamic(() => import("@/layouts/sidebar/_layout-menu"));

function renderDrawerContent(view: DRAWER_VIEW | string) {
	switch (view) {
		case "DEFAULT_SIDEBAR":
			return <Sidebar />;
		case "RETRO_SIDEBAR":
			return (
				<Sidebar
					layoutOption={`/${LAYOUT_OPTIONS.RETRO}`}
					menuItems={defaultMenuItems}
				/>
			);
		case "CLASSIC_SIDEBAR":
			return (
				<DrawerMenu
					layoutOption={`/${LAYOUT_OPTIONS.CLASSIC}`}
					menuItems={defaultMenuItems}
				/>
			);
		case "DRAWER_SEARCH":
			return <DrawerFilters />;
		default:
			return <DrawerMenu />;
	}
}

export default function DrawersContainer() {
	const layoutOptions = Object.values(LAYOUT_OPTIONS);
	const pathname = usePathname();
	const layoutSegmentFromURL = pathname!.split("/")[1];
	const searchParams = useSearchParams();
	const { view, isOpen, closeDrawer } = useDrawer();
	const { setLayout } = useLayout();

	// set initial layout on component mount
	useEffect(() => {
		const initialLayout = layoutOptions.find(
			(layout) => layout === layoutSegmentFromURL,
		);
		setLayout(() => initialLayout ?? layoutOptions[0]);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname]);

	useEffect(() => {
		closeDrawer();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname, searchParams]);

	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog
				as="div"
				className="fixed inset-0 !z-[999]"
				onClose={closeDrawer}
			>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-gray-700 bg-opacity-60 backdrop-blur" />
				</Transition.Child>

				{/* This element is need to fix FocusTap headless-ui warning issue */}
				<div className="sr-only">
					<button
						onClick={closeDrawer}
						className="opacity-50 hover:opacity-80 "
					>
						<Close className="h-auto w-[13px]" />
					</button>
				</div>

				<Transition.Child
					as={Fragment}
					enter="transform transition ease-out duration-300"
					enterFrom="-translate-x-full rtl:translate-x-full"
					enterTo="translate-x-0"
					leave="transform transition ease-in duration-300"
					leaveFrom="translate-x-0"
					leaveTo="-translate-x-full rtl:translate-x-full"
				>
					<div className="fixed inset-y-0 left-0 z-10 w-full max-w-full xs:w-auto">
						<div className="h-full w-full max-w-[280px] bg-white shadow-[0_0_80px_rgba(17,24,39,0.2)] dark:bg-dark xs:w-80">
							{view && renderDrawerContent(view)}
						</div>
					</div>
				</Transition.Child>
			</Dialog>
		</Transition>
	);
}
