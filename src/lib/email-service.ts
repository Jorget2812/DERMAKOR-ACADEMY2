import nodemailer from 'nodemailer'

/**
 * Transporter SMTP — Hostinger
 * Env vars required: SMTP_USER, SMTP_PASSWORD
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASSWORD!,
    },
  })
}

interface InvitationEmailOptions {
  to: string
  fullName: string
  inviteLink: string
}

/**
 * Send the professional invitation email manually via SMTP.
 * 
 * WHY manual? Supabase's inviteUserByEmail sends via their own 
 * SMTP which Gmail can prefetch/scan — consuming the OTP token 
 * before the user clicks it. By using generateLink() + nodemailer,
 * the token is embedded in the HTML body and Gmail cannot prefetch it.
 */
export async function sendInvitationEmail({ to, fullName, inviteLink }: InvitationEmailOptions) {
  const transporter = createTransporter()
  const firstName = fullName.split(' ')[0] || fullName

  await transporter.sendMail({
    from: '"DermaKor Swiss" <info@dermakorswiss.com>',
    to,
    subject: 'Votre accès professionnel DermaKor Swiss est prêt',
    html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accès Professionnel DermaKor Swiss</title>
</head>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;border:1px solid #E8E4DC;overflow:hidden;max-width:600px;width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="background:#1e1e1e;padding:32px 40px;text-align:center;">
              <p style="margin:0;color:#C0A76A;font-size:11px;letter-spacing:4px;text-transform:uppercase;font-weight:700;">DermaKor Swiss Sàrl</p>
              <h1 style="margin:8px 0 0;color:#FFFFFF;font-size:22px;font-weight:300;letter-spacing:1px;">Espace Professionnel</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;color:#1e1e1e;font-size:16px;">Bonjour <strong>${firstName}</strong>,</p>
              
              <p style="margin:0 0 16px;color:#6B6560;font-size:15px;line-height:1.6;">
                Votre demande d'accès professionnel a été <strong style="color:#1e1e1e;">approuvée</strong>. 
                Bienvenue dans l'espace partenaire DermaKor Swiss.
              </p>

              <p style="margin:0 0 24px;color:#6B6560;font-size:15px;line-height:1.6;">
                Cliquez sur le bouton ci-dessous pour créer votre mot de passe et accéder à votre espace :
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="background:#C0A76A;border-radius:8px;">
                    <a href="${inviteLink}"
                       style="display:inline-block;padding:16px 40px;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:0.5px;">
                      Créer mon mot de passe →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Info box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;border-radius:8px;border:1px solid #E8E4DC;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;color:#8A8578;font-size:13px;line-height:1.5;">
                      ⏱ Ce lien est valable <strong>24 heures</strong>.<br>
                      🔒 Il ne peut être utilisé qu'<strong>une seule fois</strong>.<br>
                      📧 Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Raw link fallback -->
              <p style="margin:0;color:#B0A898;font-size:12px;word-break:break-all;">
                <a href="${inviteLink}" style="color:#C0A76A;">${inviteLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #E8E4DC;text-align:center;">
              <p style="margin:0;color:#B0A898;font-size:12px;line-height:1.6;">
                DermaKor Swiss Sàrl — Ecublens, Suisse<br>
                <a href="mailto:info@dermakorswiss.com" style="color:#B0A898;">info@dermakorswiss.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Bonjour ${firstName},\n\nVotre accès professionnel DermaKor Swiss a été approuvé.\n\nCréez votre mot de passe ici (lien valable 24h) :\n${inviteLink}\n\n---\nDermaKor Swiss Sàrl — info@dermakorswiss.com`,
  })
}

export async function sendOrderNotificationEmail(params: {
  orderNumber: string
  clientName: string
  clientEmail: string
  totalAmount: string
  itemCount: number
}) {
  const { orderNumber, clientName, clientEmail, totalAmount, itemCount } = params

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'info@dermakorswiss.com'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dermakor-academy.vercel.app'

  const transporter = createTransporter()

  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFAF8; padding: 40px 30px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-family: 'Oswald', sans-serif; color: #1a1a1a; font-size: 24px; margin: 0;">
          Nouvelle Commande
        </h1>
        <div style="width: 60px; height: 3px; background: #C0A76A; margin: 12px auto;"></div>
      </div>
      
      <div style="background: #ffffff; border-radius: 8px; padding: 24px; margin-bottom: 20px; border: 1px solid #e8e8e8;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #888; font-size: 14px;">Commande</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888; font-size: 14px;">Client</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${clientName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888; font-size: 14px;">Email</td>
            <td style="padding: 8px 0; text-align: right; color: #1a1a1a;">${clientEmail}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888; font-size: 14px;">Articles</td>
            <td style="padding: 8px 0; text-align: right; color: #1a1a1a;">${itemCount} article${itemCount > 1 ? 's' : ''}</td>
          </tr>
          <tr style="border-top: 2px solid #C0A76A;">
            <td style="padding: 12px 0 8px; color: #1a1a1a; font-weight: 700; font-size: 16px;">Total</td>
            <td style="padding: 12px 0 8px; text-align: right; font-weight: 700; font-size: 16px; color: #C0A76A;">${totalAmount}</td>
          </tr>
        </table>
      </div>
      
      <div style="text-align: center;">
        <a href="https://dermakor-academy.vercel.app/fr/admin/orders" 
           style="display: inline-block; padding: 12px 32px; background: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
          Voir la commande
        </a>
      </div>
      
      <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 30px;">
        DermaKor Academy — Notification automatique
      </p>
    </div>
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL || 'info@dermakorswiss.com',
    to: adminEmail,
    subject: `🛒 Nouvelle commande ${orderNumber} — ${totalAmount}`,
    html,
  })
}
