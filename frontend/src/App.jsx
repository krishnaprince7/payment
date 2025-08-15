import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./componenet/Register";
import Login from "./componenet/Login";
import Home from "./componenet/Home";
import Notification from "./componenet/UserNotification";
import ReceverMoney from "./componenet/ReceverMoney";
import Layout from "./layout/Layout";
import Search from "./componenet/Search";
import Profile from "./componenet/Profile";
import EditProfile from "./componenet/EditProfile";



const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes with layout */}
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/notification" element={<Notification />} />
          <Route path="/notificationrecived" element={<ReceverMoney />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/editprofile" element={<EditProfile />} />

        </Route>
      </Routes>
    </Router>
  );
};

export default App;
