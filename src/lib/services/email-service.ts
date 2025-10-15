import { Resend } from "resend";
import { PitchStatusEmail } from "@/components/emails/pitch-status-email";

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendPitchStatusEmailParams {
    to: string;
    startupName: string;
    pitchTitle: string;
    status: "approved" | "rejected";
    reason?: string;
    customNotes?: string;
    submissionId: string;
}

interface EmailResponse {
    success: boolean;
    messageId?: string;
    error?: string;
}

/**
 * Send pitch status notification email to startup
 */
export async function sendPitchStatusEmail({
    to,
    startupName,
    pitchTitle,
    status,
    reason,
    customNotes,
    submissionId,
}: SendPitchStatusEmailParams): Promise<EmailResponse> {
    try {
        const statusText = status === "approved" ? "Approved" : "Rejected";
        const subject = `Your Pitch Status Update - ${statusText} | CrowdVC`;

        const { data, error } = await resend.emails.send({
            from: "CrowdVC <delivered@resend.dev>",
            // to: [to],
            to: ["mosheur.r.wolied@gmail.com"],
            subject,
            react: PitchStatusEmail({
                startupName,
                pitchTitle,
                status,
                reason,
                customNotes,
                submissionId,
            }),
        });

        if (error) {
            console.error("[Email Service] Error sending email:", error);
            return {
                success: false,
                error: error.message || "Failed to send email",
            };
        }

        console.log("[Email Service] Email sent successfully:", data?.id);
        return {
            success: true,
            messageId: data?.id,
        };
    } catch (error) {
        console.error("[Email Service] Unexpected error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
