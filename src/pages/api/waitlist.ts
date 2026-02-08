import type { APIRoute } from "astro";
import { sendEmail, isResendConfigured } from "@/lib/resend";

export const POST: APIRoute = async ({ request }) => {
  // Check if Resend is configured
  if (!isResendConfigured()) {
    return new Response(
      JSON.stringify({ 
        error: "Email service not configured",
        message: "Please reach out on Twitter @josocjoq instead"
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await request.json();
    const { name, email, project } = body;

    // Validate required fields
    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: "Name and email are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Send email using Resend
    const { data, error } = await sendEmail({
      subject: `New Waitlist Signup: ${project}`,
      html: `
        <h2>New Waitlist Signup</h2>
        <p><strong>Project:</strong> ${project}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <hr>
        <p><em>This email was sent from your waitlist form.</em></p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
