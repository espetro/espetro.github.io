import { Resend } from 'resend';

/**
 * Resend client instance
 * Initialized with API key from environment variables
 */
const resend = new Resend(import.meta.env.RESEND_API_KEY);

/**
 * Email configuration from environment variables
 */
const EMAIL_CONFIG = {
  from: import.meta.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  to: import.meta.env.RESEND_TO_EMAIL || 'onboarding@resend.dev',
} as const;

/**
 * Send an email using Resend
 * 
 * @param options - Email options including subject and HTML content
 * @returns Promise with the response data or error
 * 
 * @example
 * ```ts
 * const { data, error } = await sendEmail({
 *   subject: 'New Waitlist Signup',
 *   html: '<p>Hello world</p>'
 * });
 * ```
 */
export async function sendEmail(options: {
  subject: string;
  html: string;
}) {
  return await resend.emails.send({
    from: EMAIL_CONFIG.from,
    to: EMAIL_CONFIG.to,
    subject: options.subject,
    html: options.html,
  });
}

/**
 * Check if Resend is properly configured
 * 
 * @returns true if API key is set, false otherwise
 */
export function isResendConfigured(): boolean {
  return !!import.meta.env.RESEND_API_KEY;
}

/**
 * Get the Resend client instance
 * Use this if you need direct access to the Resend API
 */
export { resend };
