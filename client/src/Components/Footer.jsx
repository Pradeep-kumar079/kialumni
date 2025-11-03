import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left Section */}
        <div className="footer-section about">
          <h2 className="footer-logo">Answerme</h2>
          <p>
            Connecting students and alumni to share knowledge, opportunities, and experiences.
          </p>
        </div>

        {/* Center Section */}
        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/post">Posts</Link></li>
            <li><Link to="/account">Account</Link></li>
          </ul>
        </div>

        {/* Important Links */}
        <div className="footer-section links">
          <h3>Important</h3>
          <ul>
            <li><Link to="/student">Students</Link></li>
            <li><Link to="/alumni">Alumni</Link></li>
            <li><Link to="/login">Admin</Link></li>
          </ul>
        </div>

        {/* Right Section */}
        <div className="footer-section contact">
          <h3>Contact Us</h3>
          <p>Email: <a href="mailto:kitalumni26@gmail.com">kitalumni26@gmail.com</a></p>
          <p>Phone: <a href="tel:+919353198519">+91 93531 98519</a></p>

          <div className="social-icons">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <i className="fab fa-linkedin"></i>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <i className="fab fa-github"></i>
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter / X"
            >
              <i className="fab fa-twitter"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Answerme. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
