"use client"

import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TransactionStepperProps {
  status: "pending" | "success" | "error"
}

export function TransactionStepper({ status }: TransactionStepperProps) {
  const steps = [
    {
      id: 1,
      label: "Confirming transaction",
      status: status === "pending" ? "active" : status === "success" ? "complete" : "error",
    },
    {
      id: 2,
      label: "Processing on blockchain",
      status: status === "success" ? "complete" : status === "error" ? "error" : "pending",
    },
    { id: 3, label: "Updating pool", status: status === "success" ? "complete" : "pending" },
  ]

  return (
    <div className="py-8">
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  step.status === "complete" && "border-primary bg-primary text-primary-foreground",
                  step.status === "active" && "border-primary bg-background text-primary",
                  step.status === "error" && "border-destructive bg-destructive text-destructive-foreground",
                  step.status === "pending" && "border-muted bg-background text-muted-foreground",
                )}
              >
                {step.status === "complete" && <CheckCircle2 className="h-5 w-5" />}
                {step.status === "active" && <Loader2 className="h-5 w-5 animate-spin" />}
                {step.status === "error" && <XCircle className="h-5 w-5" />}
                {step.status === "pending" && <span className="text-sm font-medium">{step.id}</span>}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mt-2 h-12 w-0.5 transition-colors",
                    step.status === "complete" ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
            <div className="flex-1 pt-2">
              <p
                className={cn(
                  "text-sm font-medium transition-colors",
                  step.status === "complete" && "text-foreground",
                  step.status === "active" && "text-foreground",
                  step.status === "error" && "text-destructive",
                  step.status === "pending" && "text-muted-foreground",
                )}
              >
                {step.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {status === "success" && (
        <div className="mt-6 rounded-lg border border-primary/20 bg-primary/10 p-4 text-center">
          <p className="text-sm font-medium text-primary">Transaction successful!</p>
        </div>
      )}

      {status === "error" && (
        <div className="mt-6 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-center">
          <p className="text-sm font-medium text-destructive">Transaction failed. Please try again.</p>
        </div>
      )}
    </div>
  )
}
