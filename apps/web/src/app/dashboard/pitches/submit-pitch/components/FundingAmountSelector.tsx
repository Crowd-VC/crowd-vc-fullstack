import { cn } from "@/lib/utils";
import { FUNDING_AMOUNTS } from "../constants";

interface FundingAmountSelectorProps {
	selectedValue: string;
	onSelect: (value: string) => void;
	error?: string;
}

export function FundingAmountSelector({
	selectedValue,
	onSelect,
	error,
}: FundingAmountSelectorProps) {
	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{FUNDING_AMOUNTS.map(({ amount, description, value }) => {
					const isSelected = selectedValue === value;
					const isCustom = value === "custom";
					return (
						<button
							key={value}
							type="button"
							className={cn(
								"p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 group hover:scale-[1.02] text-center w-full",
								isSelected
									? "border-primary bg-primary/10"
									: "border-border bg-card hover:border-primary/50",
							)}
							onClick={() => onSelect(value)}
							aria-label={`Select funding amount ${amount}`}
						>
							<div className="font-semibold text-lg text-foreground mb-1">
								{amount}
							</div>
							<div className="text-xs text-muted-foreground">{description}</div>
						</button>
					);
				})}
			</div>
			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	);
}
