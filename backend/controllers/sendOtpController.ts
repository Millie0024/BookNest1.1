import { RequestHandler } from 'express';
import * as otpService from '../services/otpService';

export const sendOtpHandler: RequestHandler = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: "Email is required" });
    return;
  }

  await otpService.sendOtp(email, res); // This will handle the response
};
