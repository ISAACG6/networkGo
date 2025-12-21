import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { Button, Modal } from "react-bootstrap";
import "./App.css";

export default function Contacts({ data }) {
  const [contactList, setContactList] = useState(data?.contacts || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newContact, setNewContact] = useState({
    firstName: "",
    lastName: "",
    company: "",
  });

  // Handlers
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleContactChange = (e) => {
    setNewContact({
      ...newContact,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddContact = () => {
    const id = contactList.length + 1; // simple unique id
    setContactList([...contactList, { id, ...newContact }]);
    setNewContact({ firstName: "", lastName: "", company: "" });
    handleCloseModal();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value || "");
  };

  // Filter contacts based on search term
  const filteredContacts =
    searchTerm.trim() === ""
      ? contactList
      : contactList.filter((contact) => {
          const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
          const company = (contact.company || "").toLowerCase();
          const term = searchTerm.toLowerCase();
          return fullName.includes(term) || company.includes(term);
        });

  return (
    <div className="contacts-container">
      {/* Header */}
      <div className="d-flex mb-3 align-items-center">
        <h2 className="mb-0">Contacts</h2>
        <Button variant="success" className="ms-auto" onClick={handleOpenModal}>
          Add Contact
        </Button>
      </div>

      {/* Search input */}
      <Form className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search by name or company..."
          value={searchTerm}
          onChange={handleSearchChange}
          disabled={contactList.length === 0}
        />
      </Form>

      {/* Contact cards */}
      <Row className="contacts-list">
        {filteredContacts.map((contact) => (
          <Col key={contact.id} xs={12} className="d-flex justify-content-center mb-3">
            <Card className="contact-card-horizontal">
              <div className="contact-info">
                <div className="contact-name">
                  {contact.firstName} {contact.lastName[0]}.
                </div>
                <div className="contact-company">{contact.company}</div>
              </div>
            </Card>
          </Col>
        ))}

        {contactList.length === 0 && (
          <div className="text-center text-muted" style={{ width: "100%" }}>
            No contacts available.
          </div>
        )}

        {filteredContacts.length === 0 && contactList.length > 0 && (
          <div className="text-center text-muted" style={{ width: "100%" }}>
            No contacts match your search.
          </div>
        )}
      </Row>

      {/* Add Contact Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Contact</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={newContact.firstName}
                onChange={handleContactChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={newContact.lastName}
                onChange={handleContactChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Company</Form.Label>
              <Form.Control
                type="text"
                name="company"
                value={newContact.company}
                onChange={handleContactChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="success" onClick={handleAddContact}>
            Save changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
