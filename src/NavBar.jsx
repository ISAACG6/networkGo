
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

export default function Navigation() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Navbar 
      bg="light" 
      expand="lg" 
      className="sticky-top"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container fluid>
        <Navbar.Brand as={NavLink} to="/" onClick={() => setExpanded(false)}>
          Net
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="navbar-nav" />
        
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link 
              as={NavLink} 
              to="/" 
              end
              onClick={() => setExpanded(false)}
            >
              Tasks
            </Nav.Link>
            <Nav.Link 
              as={NavLink} 
              to="/Contacts"
              onClick={() => setExpanded(false)}
            >
              Contacts
            </Nav.Link>
            <Nav.Link 
              as={NavLink} 
              to="/Calendar"
              onClick={() => setExpanded(false)}
            >
              Calendar
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}