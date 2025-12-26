import { useState, useEffect } from 'react'
import { auth } from './main.jsx';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Auth from './Auth';
import Tasks from "./Tasks";
import Contacts from "./Contacts";
import Calendar from "./Meetings.jsx";
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Header from './Header';
import ThreeColumnLayout from './Layout';
import './App.css'

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div>
      <Header/>
      <ThreeColumnLayout user={user} />
    </div>
  );
}

export default App

