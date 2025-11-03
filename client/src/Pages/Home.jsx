import React from "react";
import Navbar from "../Components/Navbar";
import AllPosts from "../Components/AllPosts";
import ImageSlider from "../Components/ImageSlider";
import Footer from "../Components/Footer";
import UserDetails from "./UserDetails";
import FeedbackForm from "../Components/FeedbackForm";
import Gallery from "../Components/Gallary"
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <Navbar />
      <ImageSlider />

      <div className="main-content">
        {/* Left Section - All Posts */}
        <div className="left-section">
          <AllPosts />
        </div>

        {/* Right Section - User Details */}
        <div className="right-section">
          <UserDetails />
           
        </div>
      </div>
      <Gallery />

      <FeedbackForm />

      <Footer />
    </div>
  );
};

export default Home;
