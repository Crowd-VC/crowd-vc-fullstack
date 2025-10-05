"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { Card } from "@/components/ui/card";
import { Upload, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface FileUploaderCardProps {
	accept?: string[];
	className?: string;
}

export function FileUploaderCard({
	accept = ["image/png", "image/jpeg", "image/gif", "application/pdf"],
	className,
}: FileUploaderCardProps) {
	const [file, setFile] = useState<string | null>(null);
	const [fileType, setFileType] = useState<"image" | "pdf" | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [isHovering, setIsHovering] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);

		const files = e.dataTransfer.files;
		if (files?.[0]) {
			handleFile(files[0]);
		}
	};

	const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files?.[0]) {
			handleFile(files[0]);
		}
	};

	const handleFile = (uploadedFile: File) => {
		const isAccepted = accept.some((type) => {
			if (type.endsWith("/*")) {
				return uploadedFile.type.startsWith(type.replace("/*", ""));
			}
			return uploadedFile.type === type;
		});

		if (!isAccepted) {
			return;
		}

		if (uploadedFile.type === "application/pdf") {
			const reader = new FileReader();
			reader.onload = (e) => {
				setFile(e.target?.result as string);
				setFileType("pdf");
			};
			reader.readAsDataURL(uploadedFile);
		} else if (uploadedFile.type.startsWith("image/")) {
			const reader = new FileReader();
			reader.onload = (e) => {
				setFile(e.target?.result as string);
				setFileType("image");
			};
			reader.readAsDataURL(uploadedFile);
		}
	};

	const handleDelete = () => {
		setFile(null);
		setFileType(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleCardClick = () => {
		if (!file) {
			fileInputRef.current?.click();
		}
	};

	const acceptString = accept.join(",");

	return (
		<Card
			className={cn(
				"relative w-full h-full min-h-64 flex items-center justify-center cursor-pointer overflow-hidden transition-colors",
				className,
				isDragging && "border-primary bg-primary/5",
				!file && "hover:border-primary/50",
			)}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			onClick={handleCardClick}
		>
			<input
				ref={fileInputRef}
				type="file"
				accept={acceptString}
				onChange={handleFileInput}
				className="hidden"
			/>

			{!file ? (
				<div className="flex flex-col items-center gap-4 text-muted-foreground">
					<Upload className="w-12 h-12" />
					<div className="text-center">
						<p className="text-sm font-medium">
							Drop your file here or click to browse
						</p>
						<p className="text-xs mt-1">
							{accept
								.map((type) => type.split("/")[1].toUpperCase())
								.join(", ")}{" "}
							up to 10MB
						</p>
					</div>
				</div>
			) : (
				<div
					className="relative w-full h-full group"
					onMouseEnter={() => setIsHovering(true)}
					onMouseLeave={() => setIsHovering(false)}
					onClick={(e) => e.stopPropagation()}
					onKeyUp={(e) => e.stopPropagation()}
				>
					{fileType === "image" ? (
						<img
							src={file || "/placeholder.svg"}
							alt="Uploaded preview"
							className={cn(
								"w-full h-full object-cover transition-all duration-300",
								isHovering && "blur-sm scale-105",
							)}
						/>
					) : fileType === "pdf" ? (
						<div
							className={cn(
								"w-full h-full flex items-center justify-center bg-muted transition-all duration-300",
								isHovering && "blur-sm scale-105",
							)}
						>
							<Document
								file={file}
								className="flex items-center justify-center"
							>
								<Page
									pageNumber={1}
									width={400}
									renderTextLayer={false}
									renderAnnotationLayer={false}
								/>
							</Document>
						</div>
					) : null}

					{isHovering && (
						<div className="absolute inset-0 flex items-center justify-center">
							<button
								onClick={handleDelete}
								className="p-4 rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive transition-colors"
								aria-label="Delete image"
								type="button"
							>
								<Trash2 className="w-6 h-6" />
							</button>
						</div>
					)}
				</div>
			)}
		</Card>
	);
}
