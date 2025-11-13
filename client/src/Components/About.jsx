import React from "react";
import Navbar from "./Navbar"; // ✅ Add this line

const About = () => {
  return (
    <>
      <Navbar />
      <div className="about-container">
        <h1>About Us</h1>
        <p>
          Welcome to our platform! We aim to connect alumni and students to share
          experiences, opportunities, and knowledge. Our goal is to build a
          strong, supportive network for everyone.
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Doloribus est non, vero mollitia laudantium, temporibus excepturi natus ipsum quisquam voluptatum distinctio amet quaerat. Et quae nisi ex rerum eligendi nobis.lorem*2
        </p>
      </div>
    </>
  );
};

export default About;
