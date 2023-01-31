import React from "react";
import A2 from "../assets/a2.png";
import B2 from "../assets/b2.png";

const Footer = () => {
  return (
    <footer className="footer">
      <p>Built By</p>
      <a target="_blank" href="https://www.linkedin.com/in/anusha18/">
        <img src={A2} alt="Avocado Anusha" className="emoji" />
      </a>
      <a target="_blank" href="https://briha.live">
        <img src={B2} alt="Broccoli Briha" className="emoji" />
      </a>
    </footer>
  );
};

export default Footer;
