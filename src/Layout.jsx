import Contacts from "./Contacts";
import Meetings from "./Meetings";
import Tasks from "./Tasks";
import "./App.css";
import React, { useState, useEffect } from "react";
import { Accordion } from "react-bootstrap";

export default function Layout({ user }) {
  const [data, setData] = useState({ contacts: [] });

  return (
    <div className="three-column-layout">
      <div className="column">
        <Contacts user={user} data={data} setData={setData} />
      </div>
      <div className="column">
        <Tasks user={user} data={data} />
      </div>
      <div className="column">
        <Meetings user={user} data={data} />
      </div>
    </div>
  );
}

