const RESEND_API_URL = "https://api.resend.com/emails";

function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.REGISTRATION_EMAIL_FROM;

  if (!apiKey || !from) {
    return res.status(500).json({
      error: "Missing RESEND_API_KEY or REGISTRATION_EMAIL_FROM environment variable.",
    });
  }

  const { email, code } = req.body || {};
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanCode = String(code || "").replace(/\D/g, "");

  if (!isValidEmail(cleanEmail) || cleanCode.length !== 6) {
    return res.status(400).json({ error: "Invalid email or code." });
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [cleanEmail],
      subject: "Codigo de verificacion - Fragmentos",
      html: `
        <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
          <p>Tu codigo de verificacion para crear tu cuenta en Fragmentos es:</p>
          <p style="font-size: 28px; letter-spacing: 8px; font-weight: 700; margin: 24px 0;">${cleanCode}</p>
          <p>Este codigo vence en 10 minutos.</p>
          <p>Si no solicitaste este registro, puedes ignorar este correo.</p>
        </div>
      `,
      text: `Tu codigo de verificacion de Fragmentos es ${cleanCode}. Vence en 10 minutos.`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return res.status(502).json({ error: "Email provider failed.", details: errorText });
  }

  return res.status(200).json({ ok: true });
}
