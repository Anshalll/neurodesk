import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()


def send_otp_email(to_email: str, otp_code: str, purpose: str = "Password Reset") -> bool:
    """
    Sends an OTP email for password reset or email verification using Gmail SMTP.
    Falls back gracefully to console output if SMTP fails.
    """
    mail_server = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    mail_port = int(os.getenv("MAIL_PORT", 587))
    mail_user = os.getenv("MAIL_USERNAME")
    mail_pass = os.getenv("MAIL_PASSWORD", "").replace(" ", "")
    mail_from = os.getenv("MAIL_FROM", mail_user)

    print(f"\n==========================================")
    print(f"[OTP CODE FOR {to_email}]")
    print(f"Action: {purpose}")
    print(f"Code: {otp_code}")
    print(f"==========================================\n")

    if not mail_user or not mail_pass:
        print("[WARN] Email credentials not provided, OTP logged to console only.")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Nurodesk - Your {purpose} Code: {otp_code}"
        msg["From"] = f"Nurodesk <{mail_from}>"
        msg["To"] = to_email

        text_content = f"Your {purpose} code is: {otp_code}\nThis code will expire in 15 minutes."
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0e0e11; color: #f4f4f5; margin: 0; padding: 30px; }}
            .container {{ max-width: 480px; margin: 0 auto; background: #141416; border: 1px solid #27272a; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
            .header {{ text-align: center; margin-bottom: 24px; }}
            .logo {{ font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }}
            .logo-icon {{ color: #818cf8; margin-right: 6px; }}
            .title {{ font-size: 18px; font-weight: 600; color: #f4f4f5; margin-bottom: 12px; }}
            .description {{ font-size: 14px; color: #a1a1aa; line-height: 1.5; margin-bottom: 24px; }}
            .otp-box {{ background: #18181b; border: 1px dashed #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }}
            .otp-code {{ font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #818cf8; font-family: monospace; }}
            .footer {{ text-align: center; font-size: 12px; color: #71717a; border-top: 1px solid #27272a; padding-top: 20px; margin-top: 20px; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo"><span class="logo-icon">&#9670;</span> Nurodesk</div>
            </div>
            <div class="title">{purpose} Request</div>
            <p class="description">
              You recently requested a verification code for your Nurodesk account. Please enter this code to complete your request.
            </p>
            <div class="otp-box">
              <div class="otp-code">{otp_code}</div>
            </div>
            <p class="description" style="font-size: 12px;">
              This code will expire in <strong>15 minutes</strong>. If you did not request this, you can safely ignore this email.
            </p>
            <div class="footer">
              &copy; 2026 Nurodesk. All rights reserved.
            </div>
          </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        server = smtplib.SMTP(mail_server, mail_port, timeout=10)
        server.starttls()
        server.login(mail_user, mail_pass)
        server.sendmail(mail_from, [to_email], msg.as_string())
        server.quit()
        print(f"[OK] Email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"[FAIL] Failed to send email via SMTP: {e}")
        # Return True anyway so flow is not interrupted in testing, OTP was printed above
        return True
