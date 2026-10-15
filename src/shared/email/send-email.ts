import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

export async function sendEmail( to: string, otp: number) {
  const result = await brevo.transactionalEmails.sendTransacEmail({
    subject: "Email Verification",
    htmlContent: `<html><body><p>${otp}</p><p>This is for Email Verification.</p></body></html>`,
    sender: { name: process.env.SENDER_NAME, email: process.env.SENDER_EMAIL },
    to: [{ email: to }],
  });

  console.log("Email sent. Message ID:", result.messageId);
  return result;
}
