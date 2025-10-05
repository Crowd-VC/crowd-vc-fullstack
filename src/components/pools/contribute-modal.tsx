"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Pool } from "@/lib/types";
import { TransactionStepper } from "./transaction-stepper";

interface ContributeModalProps {
	pool: Pool | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (amount: number) => Promise<void>;
	walletBalance: number;
}

export function ContributeModal({
	pool,
	open,
	onOpenChange,
	onConfirm,
	walletBalance,
}: ContributeModalProps) {
	const [amount, setAmount] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [transactionStatus, setTransactionStatus] = useState<
		"idle" | "pending" | "success" | "error"
	>("idle");

	if (!pool) return null;

	const numAmount = Number.parseFloat(amount) || 0;
	const platformFee = numAmount * 0.02; // 2% platform fee
	const gasEstimate = 15; // Mock gas estimate
	const total = numAmount + platformFee + gasEstimate;

	const isValid = numAmount >= pool.min_ticket && total <= walletBalance;
	const remaining = pool.goal - pool.current_size;

	const handleContribute = async () => {
		if (!isValid) return;

		setIsProcessing(true);
		setTransactionStatus("pending");

		try {
			await onConfirm(numAmount);
			setTransactionStatus("success");
			setTimeout(() => {
				onOpenChange(false);
				setAmount("");
				setTransactionStatus("idle");
				setIsProcessing(false);
			}, 2000);
		} catch (error) {
			setTransactionStatus("error");
			setIsProcessing(false);
		}
	};

	const handleClose = () => {
		if (!isProcessing) {
			onOpenChange(false);
			setAmount("");
			setTransactionStatus("idle");
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Contribute to Pool</DialogTitle>
					<DialogDescription>{pool.title}</DialogDescription>
				</DialogHeader>

				{transactionStatus !== "idle" ? (
					<TransactionStepper status={transactionStatus} />
				) : (
					<div className="space-y-6">
						{/* Amount Input */}
						<div className="space-y-2">
							<Label htmlFor="amount">Contribution Amount (USD)</Label>
							<Input
								id="amount"
								type="number"
								placeholder={`Min. $${pool.min_ticket.toLocaleString()}`}
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								min={pool.min_ticket}
								step={1000}
							/>
							<div className="flex justify-between text-xs text-muted-foreground">
								<span>Min: ${pool.min_ticket.toLocaleString()}</span>
								<span>Available: ${remaining.toLocaleString()}</span>
							</div>
						</div>

						{/* Fee Breakdown */}
						{numAmount > 0 && (
							<div className="space-y-3 rounded-lg border border-border/50 bg-muted/30 p-4">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Contribution</span>
									<span className="font-medium">
										${numAmount.toLocaleString()}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">
										Platform Fee (2%)
									</span>
									<span className="font-medium">${platformFee.toFixed(2)}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Est. Gas Fee</span>
									<span className="font-medium">${gasEstimate.toFixed(2)}</span>
								</div>
								<Separator />
								<div className="flex justify-between">
									<span className="font-semibold">Total</span>
									<span className="font-semibold text-primary">
										${total.toFixed(2)}
									</span>
								</div>
							</div>
						)}

						{/* Wallet Balance */}
						<Alert>
							<Info className="h-4 w-4" />
							<AlertDescription>
								Wallet Balance: ${walletBalance.toLocaleString()}
							</AlertDescription>
						</Alert>

						{/* Validation Errors */}
						{numAmount > 0 && !isValid && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>
									{numAmount < pool.min_ticket
										? `Minimum contribution is $${pool.min_ticket.toLocaleString()}`
										: "Insufficient wallet balance"}
								</AlertDescription>
							</Alert>
						)}

						{/* Actions */}
						<div className="flex gap-3">
							<Button
								variant="transparent"
								onClick={handleClose}
								className="flex-1 bg-transparent"
							>
								Cancel
							</Button>
							<Button
								onClick={handleContribute}
								disabled={!isValid || isProcessing}
								className="flex-1 bg-primary hover:bg-primary/90"
							>
								Confirm Contribution
							</Button>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
