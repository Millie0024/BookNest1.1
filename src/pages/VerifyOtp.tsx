import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import "../styles/EnterOtp.css";

// Updated function to fetch both OTP and its document ID
export const fetchOtp = async (
  email: string
): Promise<{ otp: string; id: string } | null> => {
  try {
    const otpsRef = collection(db, "users", email, "otps");
    const q = query(otpsRef, orderBy("createdAt", "desc"), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No OTP found for:", email);
      return null;
    }

    const otpDoc = querySnapshot.docs[0];
    const otpData = otpDoc.data();
    const otpId = otpDoc.id;

    console.log("Fetched OTP from Firestore:", otpData.otp);
    return { otp: otpData.otp, id: otpId };
  } catch (error) {
    console.error("Error fetching OTP:", error);
    return null;
  }
};

const VerifyOtp: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async () => {
    setError("");
    setLoading(true);

    const email = (localStorage.getItem("emailForOtp") || "").toLowerCase();
    const password = localStorage.getItem("passwordForOtp") || "";
    const firstName = localStorage.getItem("firstNameForOtp") || "";
    const lastName = localStorage.getItem("lastNameForOtp") || "";

    if (!email || !password || !firstName || !lastName) {
      setError("Missing signup details. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const otpRecord = await fetchOtp(email);

      if (!otpRecord) {
        setError("OTP not found. Please request a new one.");
        setLoading(false);
        return;
      }

      console.log("User-entered OTP:", otp);

      if (otp === otpRecord.otp) {
        const userCred = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCred.user;

        await setDoc(doc(db, "users", email), {
          uid: user.uid,
          email,
          firstName,
          lastName,
          createdAt: Timestamp.now(),
        });

        alert("Account created successfully!");
        navigate("/dashboard");
      } else {
        setError("Incorrect OTP entered.");
      }
    } catch (error: any) {
      console.error("Verification failed:", error.message);

      const lowerEmail = email.toLowerCase(); // ensure consistent path casing

      // Delete OTP document if present
      const otpRecord = await fetchOtp(lowerEmail);
      if (otpRecord) {
        const otpRef = doc(db, "users", lowerEmail, "otps", otpRecord.id);
        try {
          await deleteDoc(otpRef);
          console.log("OTP deleted due to failed verification.");
        } catch (deleteError) {
          console.error("Failed to delete OTP:", deleteError);
        }
      }

      // Delete the user document (including all subcollections like otps)
      const userRef = doc(db, "users", lowerEmail);
      try {
        await deleteDoc(userRef);
        console.log("User document deleted due to failed verification.");
      } catch (deleteUserError) {
        console.error("Failed to delete user document:", deleteUserError);
      }

      setError(`Verification failed: ${error.message}`);
    }

    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 6) {
      // Limit to 6 digits
      setOtp(value);
      setError(""); // Clear error when user starts typing
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      handleVerify();
    }
  };

  return (
    <div className="verify-otp-container">
      <h2 className="verify-otp-title">Verify OTP</h2>
      <p className="verify-otp-subtitle">
        Enter the verification code sent to your device
      </p>

      <div className="otp-input-container">
        <input
          type="text"
          value={otp}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter 6-digit OTP"
          disabled={loading}
          className="otp-input"
          maxLength={6}
          autoComplete="one-time-code"
        />
      </div>

      <button
        onClick={handleVerify}
        disabled={loading || !otp.trim()}
        className="verify-button"
      >
        {loading && <span className="loading-spinner"></span>}
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default VerifyOtp;
