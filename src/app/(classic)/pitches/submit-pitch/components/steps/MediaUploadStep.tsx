import { FileText, VideoIcon, ExternalLink, Code } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormDescription,
	FormMessage,
} from "@/components/ui/form";
import { FileUploadArea } from "../FileUploadArea";
import type { CompleteFormData } from "../../validation";
import type { FileUploadType } from "../../types";
import type { UseFormReturn } from "react-hook-form";

interface MediaUploadStepProps {
	form: UseFormReturn<CompleteFormData>;
	dragActive: string | null;
	onFileUpload: (file: File, type: FileUploadType) => void;
	onFileRemove: (type: FileUploadType) => void;
	onDragStart: (type: string) => void;
	onDragEnd: () => void;
	onDrop: (e: React.DragEvent, type: FileUploadType) => void;
}

export function MediaUploadStep({
	form,
	dragActive,
	onFileUpload,
	onFileRemove,
	onDragStart,
	onDragEnd,
	onDrop,
}: MediaUploadStepProps) {
	const pitchDeck = form.watch("pitchDeck") || null;
	const pitchVideo = form.watch("pitchVideo") || null;

	return (
		<div className="space-y-8">
			<FormField
				control={form.control}
				name="pitchDeck"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="flex items-center gap-2">
							<FileText className="h-5 w-5 text-primary" />
							Pitch Deck (PDF)
						</FormLabel>
						<FormControl>
							<div>
								<FileUploadArea
									type="pitch_deck"
									file={pitchDeck}
									dragActive={dragActive}
									error={form.formState.errors.pitchDeck?.message}
									onFileUpload={onFileUpload}
									onFileRemove={onFileRemove}
									onDragStart={onDragStart}
									onDragEnd={onDragEnd}
									onDrop={onDrop}
								/>
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="pitchVideo"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="flex items-center gap-2">
							<VideoIcon className="h-5 w-5 text-primary" />
							Pitch Video (Optional)
						</FormLabel>
						<FormControl>
							<div>
								<FileUploadArea
									type="pitch_video"
									file={pitchVideo}
									dragActive={dragActive}
									onFileUpload={onFileUpload}
									onFileRemove={onFileRemove}
									onDragStart={onDragStart}
									onDragEnd={onDragEnd}
									onDrop={onDrop}
								/>
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<div className="space-y-6 bg-accent/50 p-5 rounded-sm">
				<h3 className="text-lg font-semibold text-foreground">
					Additional Media (Optional)
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<FormField
						control={form.control}
						name="demoUrl"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="flex items-center gap-2">
									<ExternalLink className="h-5 w-5 text-primary" />
									Demo URL
								</FormLabel>
								<FormControl>
									<Input
										placeholder="https://demo.yourproject.com"
										className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary h-12"
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
											}
										}}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="prototypeUrl"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="flex items-center gap-2">
									<Code className="h-5 w-5 text-primary" />
									Prototype URL
								</FormLabel>
								<FormControl>
									<Input
										placeholder="https://prototype.yourproject.com"
										className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary h-12"
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
											}
										}}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</div>
		</div>
	);
}
