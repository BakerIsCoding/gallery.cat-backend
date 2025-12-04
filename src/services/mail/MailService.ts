import envLoad from "@config/envLoader";
import nodemailer from "nodemailer";

export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: envLoad("EMAIL_HOST"),
      port: envLoad("EMAIL_PORT"),
      secure: false,
      auth: {
        user: envLoad("EMAIL_USER"),
        pass: envLoad("EMAIL_PASS"),
      },
      tls: { rejectUnauthorized: false },
    });
  }

  public async sendMail(
    to: string,
    subject: string,
    html: string,
    text: string
  ) {
    const result = await this.transporter.sendMail({
      from: `"Support" <${envLoad("EMAIL_USER")}>`,
      to,
      subject,
      html,
      text,
    });

    console.log("Email sent:", result);

    return result;
  }
}
