let resendClient = null;

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  if (!resendClient) {
    const { Resend } = require("resend");
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const FROM =
  process.env.EMAIL_FROM || "Powells <onboarding@resend.dev>";

async function sendPowellsEmail({ to, replyTo, subject, html }) {
  const recipient = to || process.env.EMAIL_USER;
  if (!recipient) {
    throw new Error("EMAIL_USER is not configured");
  }

  const resend = getResend();
  return resend.emails.send({
    from: FROM,
    to: recipient,
    reply_to: replyTo,
    subject,
    html,
  });
}

function emailLayout(title, rows) {
  const body = rows
    .map(
      ([label, value]) =>
        `<p style="margin:8px 0;"><strong>${label}:</strong> ${value}</p>`
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;padding:24px;max-width:560px;">
      <h2 style="color:#0f172a;margin:0 0 16px;">${title}</h2>
      ${body}
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;" />
      <p style="font-size:12px;color:#64748b;">Powells India Corporation — Website Form</p>
    </div>
  `;
}

module.exports = { sendPowellsEmail, emailLayout };
