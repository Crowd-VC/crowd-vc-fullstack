"use client";

import * as React from "react";
import {
	closestCenter,
	DndContext,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
	type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	IconChevronDown,
	IconChevronLeft,
	IconChevronRight,
	IconChevronsLeft,
	IconChevronsRight,
	IconCircleCheckFilled,
	IconDotsVertical,
	IconGripVertical,
	IconLayoutColumns,
	IconLoader,
	IconPlus,
	IconTrendingUp,
	IconClock,
	IconX,
	IconPool,
} from "@tabler/icons-react";
import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type Row,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";
import { z } from "zod";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const schema = z.object({
	id: z.number(),
	header: z.string(),
	type: z.string(),
	status: z.string(),
	funding_goal: z.string(),
	current_funding: z.string(),
	reviewer: z.string(),
});

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
	const { attributes, listeners } = useSortable({
		id,
	});

	return (
		<Button
			{...attributes}
			{...listeners}
			variant="ghost"
			size="icon"
			className="text-muted-foreground size-7 hover:bg-transparent"
		>
			<IconGripVertical className="text-muted-foreground size-3" />
			<span className="sr-only">Drag to reorder</span>
		</Button>
	);
}

const statusIcons = {
	"In Review": <IconClock className="size-3" />,
	Approved: (
		<IconCircleCheckFilled className="size-3 fill-green-500 dark:fill-green-400" />
	),
	"In Pool": <IconPool className="size-3 fill-blue-500 dark:fill-blue-400" />,
	Rejected: <IconX className="size-3 fill-red-500 dark:fill-red-400" />,
};

const statusVariants = {
	"In Review": "secondary",
	Approved: "default",
	"In Pool": "outline",
	Rejected: "destructive",
} as const;

const columns: ColumnDef<z.infer<typeof schema>>[] = [
	{
		id: "drag",
		header: () => null,
		cell: ({ row }) => <DragHandle id={row.original.id} />,
	},
	{
		id: "select",
		header: ({ table }) => (
			<div className="flex items-center justify-center">
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Select all"
				/>
			</div>
		),
		cell: ({ row }) => (
			<div className="flex items-center justify-center">
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
				/>
			</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "header",
		header: "Pitch Name",
		cell: ({ row }) => {
			return <TableCellViewer item={row.original} />;
		},
		enableHiding: false,
	},
	{
		accessorKey: "type",
		header: "Industry",
		cell: ({ row }) => (
			<div className="w-32">
				<Badge variant="outline" className="text-muted-foreground px-1.5">
					{row.original.type}
				</Badge>
			</div>
		),
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.original.status as keyof typeof statusIcons;
			return (
				<Badge
					variant={statusVariants[status]}
					className="text-muted-foreground px-1.5 gap-1"
				>
					{statusIcons[status]}
					{status}
				</Badge>
			);
		},
	},
	{
		accessorKey: "funding_goal",
		header: () => <div className="w-full text-right">Funding Goal</div>,
		cell: ({ row }) => (
			<form
				onSubmit={(e) => {
					e.preventDefault();
					toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
						loading: `Saving ${row.original.header}`,
						success: "Done",
						error: "Error",
					});
				}}
			>
				<Label htmlFor={`${row.original.id}-funding-goal`} className="sr-only">
					Funding Goal
				</Label>
				<Input
					className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-24 border-transparent bg-transparent text-right shadow-none focus-visible:border dark:bg-transparent"
					defaultValue={`$${Number.parseInt(row.original.funding_goal).toLocaleString()}`}
					id={`${row.original.id}-funding-goal`}
				/>
			</form>
		),
	},
	{
		accessorKey: "current_funding",
		header: () => <div className="w-full text-right">Current Funding</div>,
		cell: ({ row }) => {
			const current = Number.parseInt(row.original.current_funding);
			const goal = Number.parseInt(row.original.funding_goal);
			const percentage = goal > 0 ? Math.round((current / goal) * 100) : 0;

			return (
				<div className="text-right">
					<div className="font-medium">${current.toLocaleString()}</div>
					<div className="text-xs text-muted-foreground">
						{percentage}% funded
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "reviewer",
		header: "Reviewer",
		cell: ({ row }) => {
			const hasReviewer =
				row.original.reviewer && !row.original.reviewer.includes("Assign");

			if (hasReviewer) {
				return row.original.reviewer;
			}

			return (
				<>
					<Label htmlFor={`${row.original.id}-reviewer`} className="sr-only">
						Reviewer
					</Label>
					<Select>
						<SelectTrigger
							className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
							size="sm"
							id={`${row.original.id}-reviewer`}
						>
							<SelectValue placeholder="Assign reviewer" />
						</SelectTrigger>
						<SelectContent align="end">
							<SelectItem value="Sarah Chen">Sarah Chen</SelectItem>
							<SelectItem value="Dr. Michael Roberts">
								Dr. Michael Roberts
							</SelectItem>
							<SelectItem value="Alex Thompson">Alex Thompson</SelectItem>
							<SelectItem value="Emma Davis">Emma Davis</SelectItem>
							<SelectItem value="James Wilson">James Wilson</SelectItem>
						</SelectContent>
					</Select>
				</>
			);
		},
	},
	{
		id: "actions",
		cell: ({ row }) => (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
						size="icon"
					>
						<IconDotsVertical />
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-40">
					<DropdownMenuItem>View Details</DropdownMenuItem>
					<DropdownMenuItem>Edit Pitch</DropdownMenuItem>
					<DropdownMenuItem>Assign to Pool</DropdownMenuItem>
					<DropdownMenuSeparator />
					{row.original.status === "In Review" && (
						<>
							<DropdownMenuItem>Approve</DropdownMenuItem>
							<DropdownMenuItem variant="destructive">Reject</DropdownMenuItem>
						</>
					)}
					{row.original.status !== "In Review" && (
						<DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		),
	},
];

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
	const { transform, transition, setNodeRef, isDragging } = useSortable({
		id: row.original.id,
	});

	return (
		<TableRow
			data-state={row.getIsSelected() && "selected"}
			data-dragging={isDragging}
			ref={setNodeRef}
			className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
			style={{
				transform: CSS.Transform.toString(transform),
				transition: transition,
			}}
		>
			{row.getVisibleCells().map((cell) => (
				<TableCell key={cell.id}>
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</TableCell>
			))}
		</TableRow>
	);
}

export function DataTable({
	data: initialData,
}: {
	data: z.infer<typeof schema>[];
}) {
	const [data, setData] = React.useState(() => initialData);
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 10,
	});
	const sortableId = React.useId();
	const sensors = useSensors(
		useSensor(MouseSensor, {}),
		useSensor(TouchSensor, {}),
		useSensor(KeyboardSensor, {}),
	);

	const dataIds = React.useMemo<UniqueIdentifier[]>(
		() => data?.map(({ id }) => id) || [],
		[data],
	);

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			pagination,
		},
		getRowId: (row) => row.id.toString(),
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (active && over && active.id !== over.id) {
			setData((data) => {
				const oldIndex = dataIds.indexOf(active.id);
				const newIndex = dataIds.indexOf(over.id);
				return arrayMove(data, oldIndex, newIndex);
			});
		}
	}

	return (
		<Tabs
			defaultValue="all-pitches"
			className="w-full flex-col justify-start gap-6"
		>
			<div className="flex items-center justify-between px-4 lg:px-6">
				<Label htmlFor="view-selector" className="sr-only">
					View
				</Label>
				<Select defaultValue="all-pitches">
					<SelectTrigger
						className="flex w-fit @4xl/main:hidden"
						size="sm"
						id="view-selector"
					>
						<SelectValue placeholder="Select a view" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all-pitches">All Pitches</SelectItem>
						<SelectItem value="in-review">In Review</SelectItem>
						<SelectItem value="approved">Approved</SelectItem>
						<SelectItem value="active-pools">Active Pools</SelectItem>
					</SelectContent>
				</Select>
				<TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
					<TabsTrigger value="all-pitches">All Pitches</TabsTrigger>
					<TabsTrigger value="in-review">
						In Review <Badge variant="secondary">8</Badge>
					</TabsTrigger>
					<TabsTrigger value="approved">
						Approved <Badge variant="secondary">12</Badge>
					</TabsTrigger>
					<TabsTrigger value="active-pools">Active Pools</TabsTrigger>
				</TabsList>
				<div className="flex items-center gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm">
								<IconLayoutColumns />
								<span className="hidden lg:inline">Customize Columns</span>
								<span className="lg:hidden">Columns</span>
								<IconChevronDown />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							{table
								.getAllColumns()
								.filter(
									(column) =>
										typeof column.accessorFn !== "undefined" &&
										column.getCanHide(),
								)
								.map((column) => {
									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className="capitalize"
											checked={column.getIsVisible()}
											onCheckedChange={(value) =>
												column.toggleVisibility(!!value)
											}
										>
											{column.id}
										</DropdownMenuCheckboxItem>
									);
								})}
						</DropdownMenuContent>
					</DropdownMenu>
					<Button variant="outline" size="sm">
						<IconPlus />
						<span className="hidden lg:inline">New Pitch</span>
					</Button>
				</div>
			</div>
			<TabsContent
				value="all-pitches"
				className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
			>
				<div className="overflow-hidden rounded-lg border">
					<DndContext
						collisionDetection={closestCenter}
						modifiers={[restrictToVerticalAxis]}
						onDragEnd={handleDragEnd}
						sensors={sensors}
						id={sortableId}
					>
						<Table>
							<TableHeader className="bg-muted sticky top-0 z-10">
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map((header) => {
											return (
												<TableHead key={header.id} colSpan={header.colSpan}>
													{header.isPlaceholder
														? null
														: flexRender(
																header.column.columnDef.header,
																header.getContext(),
															)}
												</TableHead>
											);
										})}
									</TableRow>
								))}
							</TableHeader>
							<TableBody className="**:data-[slot=table-cell]:first:w-8">
								{table.getRowModel().rows?.length ? (
									<SortableContext
										items={dataIds}
										strategy={verticalListSortingStrategy}
									>
										{table.getRowModel().rows.map((row) => (
											<DraggableRow key={row.id} row={row} />
										))}
									</SortableContext>
								) : (
									<TableRow>
										<TableCell
											colSpan={columns.length}
											className="h-24 text-center"
										>
											No pitches found.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</DndContext>
				</div>
				<div className="flex items-center justify-between px-4">
					<div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
						{table.getFilteredSelectedRowModel().rows.length} of{" "}
						{table.getFilteredRowModel().rows.length} pitch(es) selected.
					</div>
					<div className="flex w-full items-center gap-8 lg:w-fit">
						<div className="hidden items-center gap-2 lg:flex">
							<Label htmlFor="rows-per-page" className="text-sm font-medium">
								Rows per page
							</Label>
							<Select
								value={`${table.getState().pagination.pageSize}`}
								onValueChange={(value) => {
									table.setPageSize(Number(value));
								}}
							>
								<SelectTrigger size="sm" className="w-20" id="rows-per-page">
									<SelectValue
										placeholder={table.getState().pagination.pageSize}
									/>
								</SelectTrigger>
								<SelectContent side="top">
									{[10, 20, 30, 40, 50].map((pageSize) => (
										<SelectItem key={pageSize} value={`${pageSize}`}>
											{pageSize}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex w-fit items-center justify-center text-sm font-medium">
							Page {table.getState().pagination.pageIndex + 1} of{" "}
							{table.getPageCount()}
						</div>
						<div className="ml-auto flex items-center gap-2 lg:ml-0">
							<Button
								variant="outline"
								className="hidden h-8 w-8 p-0 lg:flex"
								onClick={() => table.setPageIndex(0)}
								disabled={!table.getCanPreviousPage()}
							>
								<span className="sr-only">Go to first page</span>
								<IconChevronsLeft />
							</Button>
							<Button
								variant="outline"
								className="size-8"
								size="icon"
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
							>
								<span className="sr-only">Go to previous page</span>
								<IconChevronLeft />
							</Button>
							<Button
								variant="outline"
								className="size-8"
								size="icon"
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
							>
								<span className="sr-only">Go to next page</span>
								<IconChevronRight />
							</Button>
							<Button
								variant="outline"
								className="hidden size-8 lg:flex"
								size="icon"
								onClick={() => table.setPageIndex(table.getPageCount() - 1)}
								disabled={!table.getCanNextPage()}
							>
								<span className="sr-only">Go to last page</span>
								<IconChevronsRight />
							</Button>
						</div>
					</div>
				</div>
			</TabsContent>
			<TabsContent value="in-review" className="flex flex-col px-4 lg:px-6">
				<div className="aspect-video w-full flex-1 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
					Pitches awaiting admin review will appear here
				</div>
			</TabsContent>
			<TabsContent value="approved" className="flex flex-col px-4 lg:px-6">
				<div className="aspect-video w-full flex-1 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
					Approved pitches ready for pool assignment
				</div>
			</TabsContent>
			<TabsContent value="active-pools" className="flex flex-col px-4 lg:px-6">
				<div className="aspect-video w-full flex-1 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
					Investment pools with active voting
				</div>
			</TabsContent>
		</Tabs>
	);
}

const chartData = [
	{ month: "January", funding: 186000, applications: 12 },
	{ month: "February", funding: 305000, applications: 18 },
	{ month: "March", funding: 237000, applications: 15 },
	{ month: "April", funding: 473000, applications: 22 },
	{ month: "May", funding: 609000, applications: 28 },
	{ month: "June", funding: 714000, applications: 34 },
];

const chartConfig = {
	funding: {
		label: "Total Funding",
		color: "var(--primary)",
	},
	applications: {
		label: "Applications",
		color: "var(--primary)",
	},
} satisfies ChartConfig;

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
	const isMobile = useIsMobile();

	return (
		<Drawer direction={isMobile ? "bottom" : "right"}>
			<DrawerTrigger asChild>
				<Button variant="link" className="text-foreground w-fit px-0 text-left">
					{item.header}
				</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader className="gap-1">
					<DrawerTitle>{item.header}</DrawerTitle>
					<DrawerDescription>
						Pitch details and funding progress
					</DrawerDescription>
				</DrawerHeader>
				<div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
					{!isMobile && (
						<>
							<ChartContainer config={chartConfig}>
								<AreaChart
									accessibilityLayer
									data={chartData}
									margin={{
										left: 0,
										right: 10,
									}}
								>
									<CartesianGrid vertical={false} />
									<XAxis
										dataKey="month"
										tickLine={false}
										axisLine={false}
										tickMargin={8}
										tickFormatter={(value) => value.slice(0, 3)}
										hide
									/>
									<ChartTooltip
										cursor={false}
										content={<ChartTooltipContent indicator="dot" />}
									/>
									<Area
										dataKey="applications"
										type="natural"
										fill="var(--color-applications)"
										fillOpacity={0.6}
										stroke="var(--color-applications)"
										stackId="a"
									/>
									<Area
										dataKey="funding"
										type="natural"
										fill="var(--color-funding)"
										fillOpacity={0.4}
										stroke="var(--color-funding)"
										stackId="a"
									/>
								</AreaChart>
							</ChartContainer>
							<Separator />
							<div className="grid gap-2">
								<div className="flex gap-2 leading-none font-medium">
									Funding up by 18.2% this month{" "}
									<IconTrendingUp className="size-4" />
								</div>
								<div className="text-muted-foreground">
									Total funding goal: $
									{Number.parseInt(item.funding_goal).toLocaleString()}. Current
									progress: $
									{Number.parseInt(item.current_funding).toLocaleString()}(
									{Math.round(
										(Number.parseInt(item.current_funding) /
											Number.parseInt(item.funding_goal)) *
											100,
									)}
									% funded)
								</div>
							</div>
							<Separator />
						</>
					)}
					<form className="flex flex-col gap-4">
						<div className="flex flex-col gap-3">
							<Label htmlFor="header">Pitch Name</Label>
							<Input id="header" defaultValue={item.header} />
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col gap-3">
								<Label htmlFor="type">Industry</Label>
								<Select defaultValue={item.type}>
									<SelectTrigger id="type" className="w-full">
										<SelectValue placeholder="Select an industry" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="FinTech">FinTech</SelectItem>
										<SelectItem value="HealthTech">HealthTech</SelectItem>
										<SelectItem value="CleanTech">CleanTech</SelectItem>
										<SelectItem value="EdTech">EdTech</SelectItem>
										<SelectItem value="AgriTech">AgriTech</SelectItem>
										<SelectItem value="SaaS">SaaS</SelectItem>
										<SelectItem value="IoT">IoT</SelectItem>
										<SelectItem value="Mobility">Mobility</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="flex flex-col gap-3">
								<Label htmlFor="status">Status</Label>
								<Select defaultValue={item.status}>
									<SelectTrigger id="status" className="w-full">
										<SelectValue placeholder="Select a status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="In Review">In Review</SelectItem>
										<SelectItem value="Approved">Approved</SelectItem>
										<SelectItem value="In Pool">In Pool</SelectItem>
										<SelectItem value="Rejected">Rejected</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col gap-3">
								<Label htmlFor="funding_goal">Funding Goal</Label>
								<Input
									id="funding_goal"
									defaultValue={`$${Number.parseInt(item.funding_goal).toLocaleString()}`}
								/>
							</div>
							<div className="flex flex-col gap-3">
								<Label htmlFor="current_funding">Current Funding</Label>
								<Input
									id="current_funding"
									defaultValue={`$${Number.parseInt(item.current_funding).toLocaleString()}`}
								/>
							</div>
						</div>
						<div className="flex flex-col gap-3">
							<Label htmlFor="reviewer">Reviewer</Label>
							<Select defaultValue={item.reviewer}>
								<SelectTrigger id="reviewer" className="w-full">
									<SelectValue placeholder="Select a reviewer" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Sarah Chen">Sarah Chen</SelectItem>
									<SelectItem value="Dr. Michael Roberts">
										Dr. Michael Roberts
									</SelectItem>
									<SelectItem value="Alex Thompson">Alex Thompson</SelectItem>
									<SelectItem value="Emma Davis">Emma Davis</SelectItem>
									<SelectItem value="James Wilson">James Wilson</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</form>
				</div>
				<DrawerFooter>
					<Button>Save Changes</Button>
					<DrawerClose asChild>
						<Button variant="outline">Close</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
