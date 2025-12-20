import { useState } from 'react'
import Navigation from "./NavBar";
import Tasks from "./Tasks";
import Contacts from "./Contacts";
import Calendar from "./Calendar";
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app-container">
      {/* Navbar */}
      <Navigation />

      {/* Main content */}
      <div className="layout">
        <Routes>
          <Route path="/" element={<Tasks />} />
          <Route path="/Contacts" element={<Contacts />} />
          <Route path="/Calendar" element={<Calendar />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  
  );
}

export default App

