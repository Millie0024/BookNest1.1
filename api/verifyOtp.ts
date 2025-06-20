// src/api/verifyOtp.ts
import axios from "axios";

export const verifyOtp = async (email: string, otp: string) => {
  try {
    const response = await axios.post("/api/verify-otp", { email, otp });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "OTP verification failed.",
    };
  }
};
