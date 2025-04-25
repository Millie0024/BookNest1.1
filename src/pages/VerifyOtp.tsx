import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "../styles/VerifyOtp.css";
const VerifyOtp: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [userOtp, setUserOtp] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const { formData, generatedOtp } = state || {};

  const handleVerify = async () => {
    if (userOtp === generatedOtp) {
      setIsVerifying(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          createdAt: new Date(),
        });
        navigate("/dashboard");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsVerifying(false);
      }
    } else {
      setError("Incorrect OTP. Please try again.");
    }
  };

  return (
    <div className="otp-verification-page">
      <h2>OTP Verification</h2>
      <input
        type="text"
        value={userOtp}
        onChange={(e) => setUserOtp(e.target.value)}
        placeholder="Enter OTP"
      />
      <button onClick={handleVerify} disabled={isVerifying}>
        {isVerifying ? "Verifying..." : "Verify OTP"}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default VerifyOtp;
