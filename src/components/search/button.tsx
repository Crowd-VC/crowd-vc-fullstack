import { SearchIcon } from "@/components/icons/search";

export default function SearchButton() {
	return (
		<div className="relative w-full">
			<span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">
				<SearchIcon className="h-4 w-4" />
			</span>
			<input
				type="search"
				placeholder="Search"
				aria-label="Search"
				className="w-full rounded-full border border-gray-200 bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-400 dark:border-gray-700 dark:focus:border-gray-500"
			/>
		</div>
	);
}
