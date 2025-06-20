import React, { useState, ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "../styles/SignUp.css";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import emailImg from "../assets/email.png";
import personImg from "../assets/person.png";
import lockImg from "../assets/password.png";
import { sendOtp } from "../../api/sendOtp";

// Interfaces
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface FormErrors {
  firstName?: string;
  email?: string;
  password?: string;
}

const SignUp: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.password || formData.password.length < 12)
      newErrors.password = "Password must be at least 12 characters";
    return newErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        // Save user data locally
        window.localStorage.setItem("emailForOtp", formData.email);
        window.localStorage.setItem("passwordForOtp", formData.password);
        window.localStorage.setItem("firstNameForOtp", formData.firstName);
        window.localStorage.setItem("lastNameForOtp", formData.lastName);

        // Send OTP from backend
        const res = await sendOtp(formData.email);
        if (res.success) {
          console.log(res.Otp);
          alert("An OTP has been sent to your email.");
          navigate("/verify-otp");
        } else {
          throw new Error(res.message || "Failed to send OTP.");
        }
      } catch (error: any) {
        alert(error.message || "Something went wrong.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        displayName: user.displayName,
        createdAt: new Date(),
      });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Google sign-in error:", error.message);
      alert(error.message);
    }
  };

  const handleGitHubSignup = async () => {
    const provider = new GithubAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        displayName: user.displayName,
        createdAt: new Date(),
      });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("GitHub sign-in error:", error.message);
      alert(error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.4 }}
    >
      <div className="signup-container">
        <div className="signup-card">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="signup-header"
          >
            <h1>Create Account</h1>
            <p>Sign up to get started with our service</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <div className="input-with-icon">
                  <img src={personImg} alt="Person" className="input-icon" />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={
                      errors.firstName ? "error with-icon" : "with-icon"
                    }
                    placeholder="John"
                  />
                </div>
                {errors.firstName && (
                  <span className="error-message">{errors.firstName}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <div className="input-with-icon">
                  <img src={personImg} alt="Person" className="input-icon" />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="with-icon"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <img src={emailImg} alt="Email" className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "error with-icon" : "with-icon"}
                  placeholder="johndoe@example.com"
                />
              </div>
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <img src={lockImg} alt="Lock" className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "error" : ""}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="password-toggle"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <motion.button
              type="submit"
              className="signup-button"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </motion.button>
          </form>

          <div className="oauth-buttons">
            <p>Or sign up with</p>
            <div className="social-buttons">
              <motion.button
                className="social-button google"
                onClick={handleGoogleSignup}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FcGoogle size={20} />
                Google
              </motion.button>
              <motion.button
                className="social-button github"
                onClick={handleGitHubSignup}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaGithub size={20} />
                GitHub
              </motion.button>
            </div>
          </div>

          <div className="signup-footer">
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SignUp;
