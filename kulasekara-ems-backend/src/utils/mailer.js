import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // must be Google App Password
  },
  connectionTimeout: 20_000,
  greetingTimeout: 20_000,
  socketTimeout: 20_000,
});


  export async function sendResetPasswordEmail(toEmail, resetLink) {
  await transporter.sendMail({
    from: `"Kulasekara EMS" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Password Reset</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          You requested a password reset for your <strong>Kulasekara EMS</strong> account. 
          Please click the button below to set a new password.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #999; font-size: 14px; background-color: #f9f9f9; padding: 10px; border-radius: 4px;">
          <strong>Note:</strong> This link expires in 15 minutes. If you did not request this, you can ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;">
        <p style="font-size: 12px; color: #aaa; text-align: center;">
          &copy; ${new Date().getFullYear()} Kulasekara EMS
        </p>
      </div>
    `,
  });
}
