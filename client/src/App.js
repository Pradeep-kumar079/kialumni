import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./Pages/Register";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Navbar from "./Components/Navbar";
import Post from "./Components/Post";
import About from "./Components/About";
import Students from "./Components/Students";
import FindStudent from "./Components/FindStudent";
import Account from "./Components/Account";
import AcceptRequest from "./Components/AcceptRequest";
import SinglePost from "./Components/SinglePost";
import Profile from "./Components/Profile";
import Alumni from "./Components/Alumni";
import FindAlumni from "./Components/FindAlumni";
import ChatWrapper from "./Components/ChatWrapper";
import Admin from "./Pages/Admin";
import UserDetails from "./Pages/UserDetails";
import ChatPage from "./Pages/ChatPage";
import AcceptSuccess from "./Components/AcceptSuccess";
import AcceptFailed from "./Components/AcceptFailed";
import Gallary from "./Components/Gallary";
import SingleGallery from "./Components/SingleGallery";
import ForgotPass from "./Pages/ForgotPass";
import ResetPass from "./Pages/ResetPass";


const App = () => {
  const [refreshFlag, setRefreshFlag] = React.useState(false);
  const refreshStudents = () => setRefreshFlag((prev) => !prev);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/post" element={<Post />} />
        <Route path="/about" element={<About />} />
        <Route path="/students" element={<Students />} />
        <Route
          path="/findstudent/:admissionyear"
          element={<FindStudent key={refreshFlag} />}
        />
        <Route path="/alumni" element={<Alumni />} />
        <Route
          path="/findalumni/:admissionyear"
          element={<FindAlumni key={refreshFlag} />}
        />
        <Route
          path="/student/accept-request/:token"
          element={<AcceptRequest refreshStudents={refreshStudents} />}
        />
        <Route path="/account" element={<Account />} />
        <Route path="/post/:id" element={<SinglePost />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/chat/:otherUserId" element={<ChatWrapper />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/user/:id" element={<UserDetails />} />
        <Route path="/chat" element={<ChatPage />} />

        <Route path="/student/accept-success" element={<AcceptSuccess />} />
        <Route path="/student/accept-failed" element={<AcceptFailed />} />
        
        <Route path="/gallery" element={<Gallary />} />
        <Route path="/gallery/:id" element={<SingleGallery />} />
         <Route path="/forgot-password" element={<ForgotPass />} />
        <Route path="/reset-password/:token" element={<ResetPass />} />

      </Routes>
    </Router>
  );
};

export default App;
