import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendMail = async ( type: string, email: string, content: string): Promise<boolean> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
      user: process.env.ServerEmail as string,
      pass: process.env.ServerPassword as string,
    },
  });

  try {
    const mailOptions = {
      from: process.env.ServerEmail,
      to: email,
      subject: type, 
      html: content, 
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export default sendMail;
