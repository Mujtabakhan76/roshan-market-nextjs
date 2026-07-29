// WhatsApp bھیجنے والا helper — Green API (free plan) اور Ultramsg دونوں کو سپورٹ کرتا ہے۔
// .env.local میں WHATSAPP_PROVIDER=greenapi یا ultramsg سیٹ کریں۔

function cleanPakistaniNumber(mobile) {
  let clean = (mobile || "").trim().replace(/\s|-/g, "");
  if (clean.startsWith("0")) clean = "92" + clean.slice(1);
  else if (clean.startsWith("+92")) clean = clean.slice(1);
  return clean;
}

export async function sendWhatsApp(mobile, message) {
  if (!mobile) return { ok: false, reason: "no_mobile_number" };
  const provider = process.env.WHATSAPP_PROVIDER || "greenapi";
  const clean = cleanPakistaniNumber(mobile);

  try {
    if (provider === "greenapi") {
      const idInstance = process.env.GREENAPI_ID_INSTANCE;
      const apiToken = process.env.GREENAPI_API_TOKEN;
      if (!idInstance || !apiToken) return { ok: false, reason: "whatsapp_not_configured" };
      const url = `https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiToken}`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: `${clean}@c.us`, message }),
      });
      if (resp.ok) return { ok: true };
      return { ok: false, reason: `http_${resp.status}` };
    }

    if (provider === "ultramsg") {
      const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
      const token = process.env.ULTRAMSG_TOKEN;
      if (!instanceId || !token) return { ok: false, reason: "whatsapp_not_configured" };
      const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token, to: clean, body: message }),
      });
      if (resp.ok) return { ok: true };
      return { ok: false, reason: `http_${resp.status}` };
    }

    return { ok: false, reason: "unknown_provider" };
  } catch (e) {
    return { ok: false, reason: String(e) };
  }
}
