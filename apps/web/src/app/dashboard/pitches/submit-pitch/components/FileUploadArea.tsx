import { CloudUpload, ImageIcon, CheckCircle, Trash2 } from "lucide-react";
import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FileUploadType } from "../types";
import { FILE_CONSTRAINTS } from "../constants";

interface FileUploadAreaProps {
	type: FileUploadType;
	file: File | null;
	dragActive: string | null;
	error?: string;
	onFileUpload: (file: File, type: FileUploadType) => void;
	onFileRemove: (type: FileUploadType) => void;
	onDragStart: (type: string) => void;
	onDragEnd: () => void;
	onDrop: (e: React.DragEvent, type: FileUploadType) => void;
}

export function FileUploadArea({
	type,
	file,
	dragActive,
	error,
	onFileUpload,
	onFileRemove,
	onDragStart,
	onDragEnd,
	onDrop,
}: FileUploadAreaProps) {
	const constraints =
		FILE_CONSTRAINTS[type.toUpperCase() as keyof typeof FILE_CONSTRAINTS];
	const isPitchDeck = type === "pitch_deck";

	const handleClick = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = constraints.acceptAttribute;
		input.onchange = (e) => {
			const selectedFile = (e.target as HTMLInputElement).files?.[0];
			if (selectedFile) onFileUpload(selectedFile, type);
		};
		input.click();
	};

	const handleDrag = (e: React.DragEvent, dragType: string) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			onDragStart(dragType);
		} else if (e.type === "dragleave") {
			onDragEnd();
		}
	};

	if (file) {
		return (
			<div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border group hover:border-primary/30 transition-colors">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
						{isPitchDeck ? (
							<CheckCircle className="h-5 w-5 text-green-500" />
						) : (
							<ImageIcon className="h-5 w-5 text-green-500" />
						)}
					</div>
					<div>
						<span className="text-sm font-medium text-foreground block">
							{file.name}
						</span>
						<span className="text-xs text-muted-foreground">
							{(file.size / 1024 / 1024).toFixed(2)} MB
						</span>
					</div>
				</div>
				<Button
					variant="ghost"
					size="small"
					onClick={() => onFileRemove(type)}
					className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</div>
		);
	}

	return (
		<button
			type="button"
			className={cn(
				"border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 cursor-pointer bg-muted/20 relative overflow-hidden w-full",
				dragActive === type
					? "border-primary bg-primary/5 scale-[1.02]"
					: "border-border hover:border-primary/50",
				error && "border-destructive",
			)}
			onClick={handleClick}
			onDragEnter={(e) => handleDrag(e, type)}
			onDragLeave={(e) => handleDrag(e, "")}
			onDragOver={(e) => handleDrag(e, type)}
			onDrop={(e) => onDrop(e, type)}
			aria-label={`Upload ${isPitchDeck ? "pitch deck" : "pitch image"}`}
		>
			<div className="flex flex-col items-center">
				<div
					className={cn(
						"w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
						dragActive === type ? "bg-primary/20" : "bg-muted",
					)}
				>
					{isPitchDeck ? (
						<CloudUpload
							className={cn(
								"h-8 w-8 transition-colors",
								dragActive === type ? "text-primary" : "text-muted-foreground",
							)}
						/>
					) : (
						<ImageIcon
							className={cn(
								"h-8 w-8 transition-colors",
								dragActive === type ? "text-primary" : "text-muted-foreground",
							)}
						/>
					)}
				</div>
				<p className="text-lg font-medium text-foreground mb-2">
					Drop your {isPitchDeck ? "pitch deck" : "pitch image"} here
				</p>
				<p className="text-sm text-muted-foreground mb-1">
					or click to browse files
				</p>
				<p className="text-xs text-muted-foreground">
					{isPitchDeck
						? "PDF files up to 10MB"
						: "JPG, PNG files up to 10MB"}
				</p>
			</div>
		</button>
	);
}
