import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Section,
  Text,
  Hr,
} from '@react-email/components';

interface PitchStatusEmailProps {
  startupName: string;
  pitchTitle: string;
  status: 'approved' | 'rejected';
  reason?: string;
  customNotes?: string;
  submissionId: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crowdvc.app';

export const PitchStatusEmail = ({
  startupName,
  pitchTitle,
  status,
  reason,
  customNotes,
  submissionId,
}: PitchStatusEmailProps) => {
  const isApproved = status === 'approved';
  const statusColor = isApproved ? '#10b981' : '#ef4444';
  const statusText = isApproved ? 'Approved' : 'Rejected';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Img
              src={`${baseUrl}/images/crowdvc-logo.png`}
              width="200"
              height="50"
              alt="CrowdVC Logo"
              style={logo}
            />
          </Section>

          {/* Status Badge */}
          <Section style={statusBadgeSection}>
            <Text style={{ ...statusBadge, backgroundColor: statusColor }}>
              {statusText}
            </Text>
          </Section>

          {/* Main Heading */}
          <Heading style={h1}>Pitch Review Update</Heading>

          <Text style={greeting}>
            Hi {startupName}, we've completed our review of your pitch
            submission.
          </Text>

          {/* Pitch Details Box */}
          <Section style={detailsBox}>
            <Text style={detailsLabel}>Pitch Title</Text>
            <Text style={detailsValue}>{pitchTitle}</Text>
            <Text style={{ ...detailsLabel, marginTop: '16px' }}>
              Submission ID
            </Text>
            <Text style={submissionIdText}>{submissionId}</Text>
          </Section>

          {/* Status-specific content */}
          {isApproved ? (
            <>
              <Heading style={h2Success}>🎉 Congratulations!</Heading>
              <Text style={paragraph}>
                Your pitch has been approved and will be moving forward in our
                investment process.
              </Text>

              <Section style={successBox}>
                <Text style={boxHeading}>Next Steps:</Text>
                <Text style={listItem}>
                  • Your pitch will be added to an investment pool
                </Text>
                <Text style={listItem}>
                  • Investors will be able to view and contribute to your pitch
                </Text>
                <Text style={listItem}>
                  • You'll receive updates on funding progress via email
                </Text>
                <Text style={listItem}>
                  • Log in to your dashboard to track your pitch status
                </Text>
              </Section>

              {customNotes && (
                <Section style={notesBox}>
                  <Text style={notesLabel}>Additional Notes:</Text>
                  <Text style={notesText}>{customNotes}</Text>
                </Section>
              )}
            </>
          ) : (
            <>
              <Heading style={h2Error}>Review Decision</Heading>
              <Text style={paragraph}>
                After careful consideration, we've decided not to move forward
                with your pitch at this time.
              </Text>

              {reason && (
                <Section style={reasonBox}>
                  <Text style={reasonLabel}>Reason:</Text>
                  <Text style={reasonText}>{reason}</Text>
                </Section>
              )}

              {customNotes && (
                <Section style={feedbackBox}>
                  <Text style={feedbackLabel}>Additional Feedback:</Text>
                  <Text style={feedbackText}>{customNotes}</Text>
                </Section>
              )}

              <Section style={encouragementBox}>
                <Text style={encouragementText}>
                  We encourage you to refine your pitch and resubmit in the
                  future. Feel free to reach out if you have any questions or
                  need guidance.
                </Text>
              </Section>
            </>
          )}

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link href={`${baseUrl}/pitches`} style={button}>
              View Dashboard
            </Link>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Text style={footer}>
            Questions? Contact us at{' '}
            <Link href="mailto:support@crowdvc.app" style={link}>
              support@crowdvc.app
            </Link>
          </Text>
          <Text style={footerCopyright}>
            © {new Date().getFullYear()} CrowdVC. All rights reserved.
            <br />
            Empowering startups through decentralized funding.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

PitchStatusEmail.PreviewProps = {
  startupName: 'Acme Inc',
  pitchTitle: 'Revolutionary AI Platform',
  status: 'approved',
  submissionId: 'PITCH-001234-ABCD',
  customNotes: 'Great pitch! Looking forward to seeing your progress.',
} as PitchStatusEmailProps;

export default PitchStatusEmail;

// Styles
const main = {
  backgroundColor: '#f3f4f6',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  margin: '40px auto',
  padding: '40px',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#1f2937',
  padding: '32px',
  borderRadius: '8px 8px 0 0',
  marginTop: '-40px',
  marginLeft: '-40px',
  marginRight: '-40px',
  marginBottom: '32px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const statusBadgeSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const statusBadge = {
  display: 'inline-block',
  color: '#ffffff',
  padding: '8px 24px',
  borderRadius: '9999px',
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  margin: '0',
};

const h1 = {
  color: '#111827',
  fontSize: '24px',
  fontWeight: '700',
  lineHeight: '32px',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const h2Success = {
  color: '#10b981',
  fontSize: '18px',
  fontWeight: '600',
  margin: '24px 0 12px',
};

const h2Error = {
  color: '#ef4444',
  fontSize: '18px',
  fontWeight: '600',
  margin: '24px 0 12px',
};

const greeting = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const paragraph = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const detailsBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '24px',
  marginBottom: '24px',
};

const detailsLabel = {
  margin: '0 0 8px',
  fontSize: '14px',
  color: '#6b7280',
  fontWeight: '500',
};

const detailsValue = {
  margin: '0 0 16px',
  fontSize: '16px',
  color: '#111827',
  fontWeight: '600',
};

const submissionIdText = {
  margin: '0',
  fontSize: '14px',
  color: '#6b7280',
  fontFamily: 'monospace',
};

const successBox = {
  backgroundColor: '#ecfdf5',
  border: '1px solid #a7f3d0',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
};

const boxHeading = {
  margin: '0 0 12px',
  fontSize: '16px',
  fontWeight: '600',
  color: '#065f46',
};

const listItem = {
  margin: '0 0 8px',
  fontSize: '14px',
  lineHeight: '20px',
  color: '#047857',
};

const notesBox = {
  backgroundColor: '#f9fafb',
  borderLeft: '4px solid #10b981',
  padding: '16px',
  marginBottom: '24px',
};

const notesLabel = {
  margin: '0 0 8px',
  fontSize: '14px',
  fontWeight: '600',
  color: '#111827',
};

const notesText = {
  margin: '0',
  fontSize: '14px',
  lineHeight: '20px',
  color: '#6b7280',
};

const reasonBox = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '16px',
};

const reasonLabel = {
  margin: '0 0 8px',
  fontSize: '14px',
  fontWeight: '600',
  color: '#991b1b',
};

const reasonText = {
  margin: '0',
  fontSize: '14px',
  lineHeight: '20px',
  color: '#dc2626',
};

const feedbackBox = {
  backgroundColor: '#f9fafb',
  borderLeft: '4px solid #ef4444',
  padding: '16px',
  marginBottom: '16px',
};

const feedbackLabel = {
  margin: '0 0 8px',
  fontSize: '14px',
  fontWeight: '600',
  color: '#111827',
};

const feedbackText = {
  margin: '0',
  fontSize: '14px',
  lineHeight: '20px',
  color: '#6b7280',
};

const encouragementBox = {
  backgroundColor: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
};

const encouragementText = {
  margin: '0',
  fontSize: '14px',
  lineHeight: '20px',
  color: '#1e40af',
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
};

const button = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  padding: '12px 32px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: '600',
  display: 'inline-block',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const footerCopyright = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0',
  textAlign: 'center' as const,
};

const link = {
  color: '#3b82f6',
  textDecoration: 'none',
};
