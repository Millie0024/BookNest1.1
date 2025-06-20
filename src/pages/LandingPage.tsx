import React, { useEffect, useState } from "react";
import "../styles/LandingPage.css";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageLoader from "./PageLoader";
import homeImage from "../assets/home.jpg";
import logoImage from "../assets/logo.jpg";

const LandingPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200); // Simulate loading delay
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <PageLoader />;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.4 }}
    >
      <div className="landing-page">
        <nav className="navbar">
          <div className="nav-container">
            <div className="logonav">
              <img className="brand-logo" src={logoImage} alt="BookNest Logo" />
              <h1 className="brand-name">BookNest</h1>
            </div>

            <div className="nav-menu desktop">
              <div className="nav-links">
                <a href="#home">Home</a>
                <a href="#features">Features</a>
                <a href="#contact">Contact</a>
              </div>
              <div className="auth-buttons">
                <button className="login-btn">
                  <Link to="/Login">Log In</Link>
                </button>
                <button className="signup-btn">
                  <Link to="/signup">Sign Up</Link>
                </button>
              </div>
            </div>
          </div>
        </nav>

        <section id="home" className="home-section">
          <div className="home-container">
            <div className="hero-content">
              <div className="hero-text">
                <h2 className="hero-title">Your Personal Reading Sanctuary</h2>
                <p className="hero-description">
                  Discover, organize, and track your reading journey. BookNest
                  helps you build your perfect digital library and achieve your
                  reading goals.
                </p>
                <div className="hero-buttons">
                  <button className="cta-primary">
                    <Link to="/signup">Sign Up</Link>
                  </button>
                  <button className="cta-secondary">
                    <Link to="/Login">Log In</Link>
                  </button>
                </div>
              </div>

              <div className="hero-image-container">
                <div className="hero-image-wrapper">
                  <div className="hero-image-inner">
                    <img
                      src={homeImage}
                      alt="BookNest Preview"
                      className="hero-image"
                    />
                  </div>
                </div>
                <div className="decorative-circle-1" />
                <div className="decorative-circle-2" />
              </div>
            </div>

            <div className="features-grid">
              {[
                {
                  title: "Master Your Reading List",
                  description:
                    "Effortlessly Track, Manage, and Celebrate Your Bookish Journey!",
                },
                {
                  title: "Capture Wisdom from Books",
                  description:
                    "Jot Down Notes, Revisit, and Relive the Journey Anytime!",
                },
                {
                  title: "Achieve Your Reading Dreams",
                  description:
                    "Set Goals, Crush Milestones, and Track Your Journey with BookNest!",
                },
              ].map((feature, index) => (
                <div key={index} className="feature-card">
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="contact-section">
          <div className="contact-container">
            <div className="contact-header">
              <h2 className="contact-title">Stay Connected</h2>
              <p className="contact-subtitle">
                Subscribe to our newsletter for the latest updates and reading
                recommendations
              </p>
            </div>
            <div className="newsletter-container">
              <div className="contact-email">
                <Mail className="email-icon" />
                <a href="mailto:booknest64@gmail.com" className="email-link">
                  booknest64@gmail.com
                </a>
              </div>

              <form className="newsletter-form" onSubmit={handleSubmit}>
                <div className="input-group">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="subscribe-btn">
                    Subscribe
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-container">
            <p className="copyright">
              © {new Date().getFullYear()} BookNest. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </motion.div>
  );
};

export default LandingPage;
