import { Request, Response } from "express";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import { db } from "../utils/firebaseAdmin";

export const sendOtp = async (email: string, res: Response): Promise<Response> => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpId = uuidv4();
  const emailDocId = email.toLowerCase(); // sanitize email for doc ID

  try {
    // ✅ Ensure user doc exists or create it
    await db.collection("users").doc(emailDocId).set({
      email: emailDocId,
      createdAt: new Date(),
    }, { merge: true });

    // ✅ Add OTP to subcollection
    await db.collection("users")
      .doc(emailDocId)
      .collection("otps")
      .doc(otpId)
      .set({
        otp,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins expiry
      });

    // ✅ Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
       tls: {
    rejectUnauthorized: false, // Bypass self-signed cert error
  },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your BookNest OTP",
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
    });

    return res.status(200).json({ success: true, message: "OTP sent", otpId });
  } catch (err) {
    console.error("Error sending OTP:", err);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};
