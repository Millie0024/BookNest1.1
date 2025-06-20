import React, { useState, ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";
import "../styles/Login.css";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import emailImg from "../assets/email.png";
import pwdImg from "../assets/password.png";
import { collection, getDocs, query, where } from "firebase/firestore";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof LoginFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = (): LoginFormErrors => {
    const newErrors: LoginFormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        // 🔍 Search for user document by email
        const querySnapshot = await getDocs(
          query(collection(db, "users"), where("email", "==", formData.email))
        );

        if (querySnapshot.empty) {
          alert("User does not exist. Please sign up.");
          return;
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        // 🔐 Compare plaintext passwords
        if (userData.password === formData.password) {
          navigate("/dashboard");
        } else {
          setErrors({ general: "Incorrect password." });
        }
      } catch (error: any) {
        console.error("Login error:", error);
        setErrors({ general: "Login failed. Please try again." });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    setIsSubmitting(true);
    try {
      const authProvider =
        provider === "google"
          ? new GoogleAuthProvider()
          : new GithubAuthProvider();

      const result = await signInWithPopup(auth, authProvider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      // 🔧 Automatically create doc if missing
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date(),
        });
      }

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Social login error:", error);
      setErrors({ general: "Social login failed. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.4 }}
    >
      <div className="login-container">
        <div className="login-card">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="login-header"
          >
            <h1>Welcome Back</h1>
            <p>Login to your account</p>
          </motion.div>

          {errors.general && (
            <div className="error-banner">{errors.general}</div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
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
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <a href="#forgot-password" className="forgot-password">
                  Forgot Password?
                </a>
              </div>
              <div className="password-input-container">
                <img src={pwdImg} alt="Password" className="input-icon" />
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
              className="login-button"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? "Logging In..." : "Login"}
            </motion.button>
          </form>

          <div className="login-footer">
            <p>
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>

            <div className="divider">
              <span>Or continue with</span>
            </div>

            <div className="social-buttons">
              <button
                className="social-button google"
                onClick={() => handleSocialLogin("google")}
              >
                <FcGoogle size={20} />
                Google
              </button>
              <button
                className="social-button github"
                onClick={() => handleSocialLogin("github")}
              >
                <FaGithub size={20} />
                GitHub
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
