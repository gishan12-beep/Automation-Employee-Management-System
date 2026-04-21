import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Configures the nodemailer transporter with Gmail service and authentication from environment variables
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

// Sends a password reset email with a specific reset link to the user
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

// Sends an initial welcome email with temporary login credentials when a new employee account is created
export async function sendCredentialsEmail(toEmail, username, tempPassword) {
  try {
    await transporter.sendMail({
      from: `"Kulasekara EMS" <${process.env.MAIL_USER}>`,
      to: toEmail,
      subject: "Your New Employee Account Credentials",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2c5530; border-bottom: 2px solid #4a7c4e; padding-bottom: 10px;">Welcome to Kulasekara EMS</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">
            Your employee account has been created successfully. Below are your login credentials.
          </p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #4a7c4e; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #334155;"><strong>Username:</strong> <span style="font-family: monospace; font-size: 16px;">${username}</span></p>
            <p style="margin: 5px 0; color: #334155;"><strong>Temporary Password:</strong> <span style="font-family: monospace; font-size: 16px;">${tempPassword}</span></p>
          </div>

          <p style="color: #555; font-size: 14px;">
            Please log in using these credentials. You will be required to change your password immediately upon first login.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || '#'}" 
               style="background: linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Login to Dashboard
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;">
          <p style="font-size: 12px; color: #aaa; text-align: center;">
            &copy; ${new Date().getFullYear()} Kulasekara EMS. Please do not share these credentials.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending credentials email:", error);
    // Don't throw, just log
  }
}
