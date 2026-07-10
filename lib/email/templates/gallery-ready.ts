interface GalleryReadyParams {
  booking: {
    eventDate: string
    eventType: string
    galleryToken: string
  }
  customer: {
    name: string
    email: string
  }
  appUrl: string
}

function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

export function galleryReadyHtml({ booking: b, customer: c, appUrl }: GalleryReadyParams): string {
  const galleryUrl = `${appUrl}/gallery/${b.galleryToken}`

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your Gallery is Ready - Demarks 360</title>
</head>
<body style="margin:0;padding:0;background:#221A0F;font-family:Georgia,serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#221A0F;">
<tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="100%" style="max-width:560px;background:#221A0F;border-radius:4px;overflow:hidden;">

  <!-- Logo -->
  <tr><td style="background:#17110A;padding:28px 40px;">
    <p style="margin:0;font-family:Arial Black,Arial,sans-serif;font-size:18px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:#141009;">
      DEMARKS <span style="color:#E8B25C;">360</span>
    </p>
  </td></tr>

  <!-- Crimson accent -->
  <tr><td style="height:3px;background:#E8B25C;"></td></tr>

  <!-- Hero -->
  <tr><td style="background:#111111;padding:48px 40px 40px;text-align:center;">
    <!-- Camera icon -->
    <div style="width:64px;height:64px;border-radius:50%;border:2px solid rgba(192,41,58,0.4);display:inline-flex;align-items:center;justify-content:center;margin-bottom:24px;font-size:28px;line-height:64px;">
      🎬
    </div>
    <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#E8B25C;">
      Your Gallery is Ready
    </p>
    <h1 style="margin:0;font-family:Arial Black,Arial,sans-serif;font-size:36px;font-weight:900;letter-spacing:0.02em;text-transform:uppercase;color:#F5EFE2;line-height:1.05;">
      Your Videos<br>Are Live
    </h1>
  </td></tr>

  <!-- Event context -->
  <tr><td style="padding:32px 40px;border-bottom:1px solid #ede8e1;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#999;font-family:Arial,sans-serif;">Event</p>
    <p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#F5EFE2;font-family:Arial Black,Arial,sans-serif;text-transform:uppercase;">${b.eventType}</p>
    <p style="margin:0;font-size:14px;color:#666;font-family:Arial,sans-serif;">${fmtDate(b.eventDate)}</p>
  </td></tr>

  <!-- Message -->
  <tr><td style="padding:32px 40px;border-bottom:1px solid #ede8e1;">
    <p style="margin:0 0 12px;font-size:15px;color:#333;font-family:Arial,sans-serif;line-height:1.65;">
      Hi ${c.name.split(' ')[0]},
    </p>
    <p style="margin:0 0 12px;font-size:15px;color:#333;font-family:Arial,sans-serif;line-height:1.65;">
      Your 360 video gallery from <strong>${fmtDate(b.eventDate)}</strong> is ready to view. All your moments have been processed and are available to watch and download.
    </p>
    <p style="margin:0;font-size:15px;color:#333;font-family:Arial,sans-serif;line-height:1.65;">
      Click below to open your private gallery. The link is unique to your event and can be shared with your guests.
    </p>
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:40px;text-align:center;">
    <a href="${galleryUrl}" style="display:inline-block;background:#E8B25C;color:#141009;text-decoration:none;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;padding:16px 36px;border-radius:2px;">
      View My Gallery →
    </a>
    <p style="margin:20px 0 0;font-size:11px;color:#999;font-family:Arial,sans-serif;">
      Or copy this link: <a href="${galleryUrl}" style="color:#E8B25C;word-break:break-all;">${galleryUrl}</a>
    </p>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#17110A;padding:28px 40px;text-align:center;">
    <p style="margin:0 0 8px;font-family:Arial Black,Arial,sans-serif;font-size:13px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:#141009;">
      DEMARKS <span style="color:#E8B25C;">360</span>
    </p>
    <p style="margin:0;font-size:12px;color:rgba(245,240,234,0.35);font-family:Arial,sans-serif;">
      Calgary, Alberta · demarks360.ca
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}
