import Contacts from "./Contacts";
import Calendar from "./Calendar";
import Tasks from "./Tasks";
import "./App.css";
import React, { useState, useEffect } from "react";
import { Accordion } from "react-bootstrap";
import sampleData from "../sampleContacts.json";

export default function Layout() {
  return (
    <div className="three-column-layout">
      <div className="column">
        <Contacts data={sampleData}/>
      </div>
      <div className="column">
        <Tasks />
      </div>
      <div className="column">
        <Calendar />
      </div>
    </div>
  );
}

