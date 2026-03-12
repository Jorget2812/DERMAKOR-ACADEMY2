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

export async function sendOrderConfirmationEmail(params: {
  to: string
  clientName: string
  orderNumber: string
  items: Array<{
    productName: string
    quantity: number
    unitPriceHT: number
    subtotalHT: number
  }>
  subtotalHT: number
  tvaAmount: number
  tvaRate: number
  shippingCost: number
  totalTTC: number
  bankDetails: {
    beneficiary: string
    iban: string
    bank: string
    swift_bic?: string
  }
}) {
  const { to, clientName, orderNumber, items, subtotalHT, tvaAmount, shippingCost, totalTTC, bankDetails } = params
  const transporter = createTransporter()

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px 8px; border-bottom: 1px solid #f0f0ed; font-size: 14px; color: #1a1a1a;">${item.productName}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #f0f0ed; text-align: center; font-size: 14px; color: #1a1a1a;">${item.quantity}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #f0f0ed; text-align: right; font-size: 14px; color: #1a1a1a;">${item.unitPriceHT.toFixed(2)}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #f0f0ed; text-align: right; font-size: 14px; color: #1a1a1a; font-weight: 600;">${item.subtotalHT.toFixed(2)}</td>
    </tr>
  `).join('')

  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFAF8; padding: 40px 30px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h2 style="font-family: 'Times New Roman', serif; letter-spacing: 2px; color: #1a1a1a; font-size: 20px; margin: 0; text-transform: uppercase;">DERMAKOR ACADEMY</h2>
        <div style="width: 60px; height: 3px; background: #C0A76A; margin: 15px auto;"></div>
      </div>

      <p style="color: #1a1a1a; font-size: 16px; line-height: 1.5;">Bonjour ${clientName},</p>
      <p style="color: #1a1a1a; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">Merci pour votre commande. Voici le récapitulatif de votre achat.</p>

      <div style="background: #ffffff; border: 1px solid #e8e8e8; border-radius: 8px; overflow: hidden; margin-bottom: 30px;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f5f0;">
              <th style="padding: 12px 8px; text-align: left; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Produit</th>
              <th style="padding: 12px 8px; text-align: center; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Qté</th>
              <th style="padding: 12px 8px; text-align: right; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Prix Unitaire</th>
              <th style="padding: 12px 8px; text-align: right; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Sous-total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="padding: 20px; background: #fafafa;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; color: #888; font-size: 14px;">Sous-total HT</td>
              <td style="padding: 4px 0; text-align: right; color: #1a1a1a; font-size: 14px;">${subtotalHT.toFixed(2)} CHF</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #888; font-size: 14px;">TVA (8.1%)</td>
              <td style="padding: 4px 0; text-align: right; color: #1a1a1a; font-size: 14px;">${tvaAmount.toFixed(2)} CHF</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #888; font-size: 14px;">Frais de livraison</td>
              <td style="padding: 4px 0; text-align: right; color: #1a1a1a; font-size: 14px;">${shippingCost.toFixed(2)} CHF</td>
            </tr>
            <tr>
              <td style="padding: 12px 0 0; color: #1a1a1a; font-weight: 700; font-size: 18px;">Total TTC</td>
              <td style="padding: 12px 0 0; text-align: right; font-weight: 700; font-size: 18px; color: #C0A76A;">${totalTTC.toFixed(2)} CHF</td>
            </tr>
          </table>
        </div>
      </div>

      <div style="background: #ffffff; border: 1px solid #e8e8e8; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
        <h3 style="margin-top: 0; font-size: 16px; color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #f0f0ed; padding-bottom: 15px;">Instructions de paiement</h3>
        <p style="color: #1a1a1a; font-size: 14px; line-height: 1.6;">Pour finaliser votre commande, veuillez effectuer un virement bancaire avec les informations suivantes :</p>
        
        <table style="width: 100%; font-size: 14px; margin-top: 15px;">
          <tr>
            <td style="padding: 6px 0; color: #888; width: 100px;">Bénéficiaire</td>
            <td style="padding: 6px 0; color: #1a1a1a; font-weight: 600;">${bankDetails.beneficiary}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #888;">Banque</td>
            <td style="padding: 6px 0; color: #1a1a1a; font-weight: 600;">${bankDetails.bank}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #888;">IBAN</td>
            <td style="padding: 6px 0; color: #C0A76A; font-weight: 700; font-family: monospace; font-size: 15px;">${bankDetails.iban}</td>
          </tr>
          ${bankDetails.swift_bic ? `
          <tr>
            <td style="padding: 6px 0; color: #888;">SWIFT/BIC</td>
            <td style="padding: 6px 0; color: #1a1a1a; font-weight: 600;">${bankDetails.swift_bic}</td>
          </tr> ` : ''}
          <tr>
            <td style="padding: 6px 0; color: #888;">Référence</td>
            <td style="padding: 6px 0; color: #1a1a1a; font-weight: 700;">${orderNumber}</td>
          </tr>
        </table>
        
        <div style="margin-top: 20px; padding: 12px; background: #FAFAF8; border-left: 3px solid #C0A76A; font-size: 13px; color: #1a1a1a;">
          Veuillez indiquer le numéro de commande <strong>${orderNumber}</strong> comme référence de paiement pour nous aider à identifier votre versement.
        </div>
      </div>

      <div style="text-align: center; color: #888; font-size: 13px; line-height: 1.6;">
        <p>Si vous avez des questions, contactez-nous à <a href="mailto:info@dermakorswiss.com" style="color: #C0A76A; text-decoration: none;">info@dermakorswiss.com</a></p>
        <p style="margin-top: 20px; color: #aaa; font-style: italic;">DermaKor Academy — Votre partenaire en cosméceutiques professionnels</p>
      </div>
    </div>
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL || 'info@dermakorswiss.com',
    to,
    subject: `Confirmation de commande ${orderNumber} — DermaKor Academy`,
    html,
  })
}

export async function sendPaymentConfirmedEmail(params: {
  to: string
  clientName: string
  orderNumber: string
  totalTTC: number
}) {
  const { to, clientName, orderNumber, totalTTC } = params
  const transporter = createTransporter()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dermakor-academy.vercel.app'

  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFAF8; padding: 40px 30px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h2 style="font-family: 'Times New Roman', serif; letter-spacing: 2px; color: #1a1a1a; font-size: 20px; margin: 0; text-transform: uppercase;">DERMAKOR ACADEMY</h2>
        <div style="width: 60px; height: 3px; background: #C0A76A; margin: 15px auto;"></div>
      </div>

      <p style="color: #1a1a1a; font-size: 16px; line-height: 1.5;">Bonjour ${clientName},</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="font-size: 48px; color: #C0A76A; margin-bottom: 10px;">✓</div>
        <h3 style="font-size: 18px; color: #1a1a1a; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Paiement Reçu</h3>
      </div>

      <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
        Nous avons bien reçu votre paiement pour la commande <strong>${orderNumber}</strong>.
      </p>

      <div style="background: #ffffff; border: 1px solid #e8e8e8; border-radius: 8px; padding: 25px; margin-bottom: 35px;">
        <table style="width: 100%; font-size: 15px;">
          <tr>
            <td style="padding: 10px 0; color: #888;">Numéro de commande</td>
            <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-weight: 600;">${orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #888;">Montant total</td>
            <td style="padding: 10px 0; text-align: right; color: #C0A76A; font-weight: 700; font-size: 18px;">${totalTTC.toFixed(2)} CHF</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #888;">Statut</td>
            <td style="padding: 10px 0; text-align: right;"><span style="color: #C0A76A; font-weight: 700;">PAYÉ ✓</span></td>
          </tr>
        </table>
      </div>

      <p style="color: #1a1a1a; font-size: 15px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
        Votre commande est maintenant en cours de préparation. Vous recevrez une notification dès qu'elle sera expédiée.
      </p>

      <div style="text-align: center; margin-bottom: 40px;">
        <a href="${appUrl}/fr/app/orders" 
           style="display: inline-block; padding: 14px 36px; background: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
          Voir ma commande
        </a>
      </div>

      <div style="text-align: center; color: #888; font-size: 13px; line-height: 1.6; border-top: 1px solid #e8e8e8; padding-top: 30px;">
        <p>Si vous avez des questions, contactez-nous à <a href="mailto:info@dermakorswiss.com" style="color: #C0A76A; text-decoration: none;">info@dermakorswiss.com</a></p>
        <p style="margin-top: 20px; color: #aaa; font-style: italic;">DermaKor Academy — Votre partenaire en cosméceutiques professionnels</p>
      </div>
    </div>
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL || 'info@dermakorswiss.com',
    to,
    subject: `Paiement confirmé — Commande ${orderNumber} — DermaKor Academy`,
    html,
  })
}
