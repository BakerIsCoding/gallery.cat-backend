export type SimpleVerifyParams = {
  username: string;
  verifyUrl: string;
  supportEmail?: string;
  expiresIn?: string;
  ctaText?: string;
};

export function simpleVerifyTemplate(params: SimpleVerifyParams) {
  const {
    username,
    verifyUrl = "",
    supportEmail = "noreply@gallery.cat",
    expiresIn = "60 minutos",
    ctaText = "Verificar correo",
  } = params;

  const bg = "#171d20";
  const panel = "#282c34";
  const muted = "#97a0a6";
  const accentBlue = "#0aa1ff";
  const accentGreen = "#86c96f";
  const textColor = "#e6eef2";

  const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Gallery.cat — Verificación</title>
  </head>
  <body style="margin:0;background:${bg};font-family:Inter,Segoe UI,Roboto,Arial,sans-serif;color:${textColor};-webkit-font-smoothing:antialiased;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" style="max-width:600px;background:${panel};border-radius:8px;padding:20px;border:1px solid rgba(255,255,255,0.03);">
            <tr>
              <td style="text-align:left;padding-bottom:12px;">
                <div style="font-weight:700;color:${accentGreen};font-size:18px;">Gallery.cat</div>
              </td>
            </tr>

            <tr>
              <td style="padding:8px 0 18px 0;">
                <h2 style="margin:0 0 8px 0;color:${textColor};font-size:18px;">Verifica tu correo</h2>
                <p style="margin:0;color:${muted};line-height:1.4;">
                  Hola ${escapeHtml(
                    username
                  )}, gracias por registrarte. Haz clic en el botón para verificar tu dirección de correo.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:12px 0;">
                ${
                  verifyUrl
                    ? `<a href="${escapeAttr(
                        verifyUrl
                      )}" target="_blank" style="background:${accentBlue};color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:700;">${escapeHtml(
                        ctaText
                      )}</a>`
                    : `<div style="background:${accentBlue};color:#fff;padding:10px 18px;border-radius:6px;display:inline-block;font-weight:700;">${escapeHtml(
                        ctaText
                      )}</div>`
                }
              </td>
            </tr>

            ${
              verifyUrl
                ? `<tr><td style="padding:10px 0 0 0;color:${muted};font-size:13px;word-break:break-all;"><small>Si el botón no funciona, pega la siguiente URL en tu navegador:</small><br/><a href="${escapeAttr(
                    verifyUrl
                  )}" style="color:${accentBlue};text-decoration:none;">${escapeHtml(
                    verifyUrl
                  )}</a></td></tr>`
                : ""
            }

            <tr>
              <td style="padding-top:18px;color:${muted};font-size:13px;">
                Este código expira en <strong style="color:${textColor}">${escapeHtml(
    expiresIn
  )}</strong>.<br/>
                Si no solicitaste esto, ignora este mensaje.
              </td>
            </tr>

            <tr>
              <td style="padding-top:16px;border-top:1px solid rgba(255,255,255,0.03);color:${muted};font-size:12px;text-align:center;">
                gallery.cat — ${new Date().getFullYear()}
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();

  const text = [
    `gallery.cat — Verificación de correo`,
    ``,
    `Hola ${username},`,
    ``,
    `Gracias por registrarte en gallery.cat. Para verificar tu correo, usa el enlace:`,
    verifyUrl,
    ``,
    `El código expira en ${expiresIn}.`,
    ``,
    `Si no solicitaste esto, ignora este correo`,
    ``,
    `gallery.cat`,
  ].join("\n");

  return { html, text };
}

function escapeHtml(s: string) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function escapeAttr(s: string) {
  return String(s || "").replace(/"/g, "%22");
}
