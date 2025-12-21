import { useState } from 'react'
import Tasks from "./Tasks";
import Contacts from "./Contacts";
import Calendar from "./Calendar";
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Header from './Header';
import ThreeColumnLayout from './Layout';
import './App.css'

function App() {

  return (
    <div>
      <Header />
      <ThreeColumnLayout />


    </div>
  
  );
}

export default App

