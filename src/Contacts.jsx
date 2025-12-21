import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./App.css";

export default function Contacts({ data }) {
  const contacts = data?.contacts || [];
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value || "");
  };

    const filteredContacts =
    (searchTerm ?? "").trim() === ""
      ? contacts
      : contacts.filter((contact) => {
          const fullName = `${contact.firstName || ""} ${contact.lastName || ""}`.toLowerCase();
          const company = (contact.company || "").toLowerCase();
          const term = (searchTerm || "").toLowerCase();
          return fullName.includes(term) || company.includes(term);
        });


    return (
    <div className="contacts-container">
      <h2 className="mb-3">Contacts</h2>

      {/* Controlled search input */}
      <Form className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search by name or company..."
          value={searchTerm}
          onChange={handleSearchChange}
          disabled={contacts.length === 0} // disable if no contacts
        />
      </Form>

      <Row className="contacts-list">
        {filteredContacts.map((contact) => (
          <Col key={contact.id} xs={12} className="d-flex justify-content-center mb-3">
            <Card className="contact-card-horizontal">
              <div className="contact-info">
                <div className="contact-name">{contact.firstName + " " + contact.lastName}</div>
                <div className="contact-company">{contact.company}</div>
              </div>
            </Card>
          </Col>
        ))}

        {contacts.length === 0 && (
          <div className="text-center text-muted" style={{ width: "100%" }}>
            No contacts available.
          </div>
        )}

        {filteredContacts.length === 0 && contacts.length > 0 && (
          <div className="text-center text-muted" style={{ width: "100%" }}>
            No contacts match your search.
          </div>
        )}
      </Row>
    </div>
  );
}

