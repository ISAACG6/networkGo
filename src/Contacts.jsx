import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { Button } from "react-bootstrap";
import "./App.css";

export default function Contacts({ data }) {
  const [contactList, setContactList] = useState(data?.contacts || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("list"); // "list" or "edit"
  const [editingContact, setEditingContact] = useState(null);
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    company: "",
    referredBy: "", // will store contact id or custom text
  });
  const [showReferralDropdown, setShowReferralDropdown] = useState(false);
  const [referralSearch, setReferralSearch] = useState("");

  // Handlers
  const handleOpenAddContact = () => {
    setEditingContact(null);
    setContactForm({ firstName: "", lastName: "", company: "", referredBy: "" });
    setReferralSearch("");
    setCurrentView("edit");
  };

  const handleOpenEditContact = (contact) => {
    setEditingContact(contact);
    setContactForm({
      firstName: contact.firstName,
      lastName: contact.lastName,
      company: contact.company,
      referredBy: contact.referredBy || "",
    });
    // Set the search field to show the referral
    if (contact.referredBy) {
      const referredContact = contactList.find((c) => c.id === contact.referredBy);
      setReferralSearch(
        referredContact 
          ? `${referredContact.firstName} ${referredContact.lastName}`
          : contact.referredBy
      );
    } else {
      setReferralSearch("");
    }
    setCurrentView("edit");
  };

  const handleCloseEdit = () => {
    setCurrentView("list");
    setEditingContact(null);
    setContactForm({ firstName: "", lastName: "", company: "", referredBy: "" });
    setReferralSearch("");
    setShowReferralDropdown(false);
  };

  const handleContactChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveContact = () => {
    if (editingContact) {
      // Update existing contact
      setContactList(
        contactList.map((c) =>
          c.id === editingContact.id ? { ...c, ...contactForm } : c
        )
      );
    } else {
      // Add new contact
      const id = contactList.length > 0 
        ? Math.max(...contactList.map(c => c.id)) + 1 
        : 1;
      setContactList([...contactList, { id, ...contactForm }]);
    }
    handleCloseEdit();
  };

  const handleSelectReferral = (contact) => {
    setContactForm({ ...contactForm, referredBy: contact.id });
    setReferralSearch(`${contact.firstName} ${contact.lastName}`);
    setShowReferralDropdown(false);
  };

  const handleClearReferral = () => {
    setContactForm({ ...contactForm, referredBy: "" });
    setReferralSearch("");
  };

  const handleReferralSearchChange = (e) => {
    const value = e.target.value;
    setReferralSearch(value);
    setContactForm({ ...contactForm, referredBy: value }); // Save custom text
    setShowReferralDropdown(true);
  };

  const handleReferralBlur = () => {
    // Delay to allow click on dropdown item
    setTimeout(() => {
      setShowReferralDropdown(false);
    }, 200);
  };

  const handleClickReferralCard = (contact) => {
    // Navigate to the referral's profile
    handleOpenEditContact(contact);
  };

  // Get available contacts for referral (exclude current contact being edited)
  const availableReferrals = contactList.filter(
    (c) => c.id !== editingContact?.id
  );

  // Filter referrals based on search
  const filteredReferrals = referralSearch.trim() === ""
    ? availableReferrals
    : availableReferrals.filter((contact) => {
        const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
        const company = (contact.company || "").toLowerCase();
        const term = referralSearch.toLowerCase();
        return fullName.includes(term) || company.includes(term);
      });

  // Get the selected referral contact
  const selectedReferral = contactForm.referredBy
    ? contactList.find((c) => c.id === contactForm.referredBy)
    : null;

  // Check if referredBy is a contact ID (number) or custom text (string)
  const isReferralContact = typeof contactForm.referredBy === 'number';

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

  // Render edit view
  if (currentView === "edit") {
    return (
      <div className="contacts-container">
        <div className="d-flex mb-4 align-items-center">
          <h2 className="mb-0">
            {editingContact ? "Edit Contact" : "Add Contact"}
          </h2>
          <Button variant="outline-secondary" className="ms-auto" onClick={handleCloseEdit}>
            ← Back
          </Button>
        </div>

        <div className="contact-edit-form">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={contactForm.firstName}
                onChange={handleContactChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={contactForm.lastName}
                onChange={handleContactChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Company</Form.Label>
              <Form.Control
                type="text"
                name="company"
                value={contactForm.company}
                onChange={handleContactChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Referred By</Form.Label>
              <div style={{ position: "relative" }}>
                <Form.Control
                  type="text"
                  placeholder="Search contacts or type a name..."
                  value={referralSearch}
                  onChange={handleReferralSearchChange}
                  onFocus={() => setShowReferralDropdown(true)}
                  onBlur={handleReferralBlur}
                />
                {referralSearch && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleClearReferral}
                    style={{
                      position: "absolute",
                      right: "5px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      padding: "0 8px",
                      textDecoration: "none",
                    }}
                  >
                    ×
                  </Button>
                )}
                {showReferralDropdown && availableReferrals.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      maxHeight: "200px",
                      overflowY: "auto",
                      backgroundColor: "white",
                      border: "1px solid #dee2e6",
                      borderRadius: "0.375rem",
                      marginTop: "4px",
                      zIndex: 1000,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    {filteredReferrals.length > 0 ? (
                      filteredReferrals.map((contact) => (
                        <div
                          key={contact.id}
                          onClick={() => handleSelectReferral(contact)}
                          style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            borderBottom: "1px solid #f0f0f0",
                            backgroundColor:
                              contactForm.referredBy === contact.id
                                ? "#e7f3ff"
                                : "white",
                          }}
                          onMouseEnter={(e) => {
                            if (contactForm.referredBy !== contact.id) {
                              e.target.style.backgroundColor = "#f8f9fa";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (contactForm.referredBy !== contact.id) {
                              e.target.style.backgroundColor = "white";
                            }
                          }}
                        >
                          <div style={{ fontWeight: "500" }}>
                            {contact.firstName} {contact.lastName}
                          </div>
                          {contact.company && (
                            <div
                              style={{ fontSize: "0.875rem", color: "#6c757d" }}
                            >
                              {contact.company}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          color: "#6c757d",
                          fontSize: "0.875rem",
                        }}
                      >
                        No matching contacts. You can still save "{referralSearch}" as a custom referral.
                      </div>
                    )}
                  </div>
                )}
              </div>
              {!selectedReferral && (
                <Form.Text className="text-muted">
                  Select from your contacts or type a custom name (e.g., "Dad", "LinkedIn")
                </Form.Text>
              )}
              
              {/* Show referral contact card if a contact from database is selected */}
              {selectedReferral && (
                <div className="mt-3">
                  <Card 
                    className="contact-card-horizontal"
                    onClick={() => handleClickReferralCard(selectedReferral)}
                    style={{ cursor: "pointer", width: "100%", maxWidth: "100%" }}
                  >
                    <div className="contact-info">
                      <div className="contact-name">
                        {selectedReferral.firstName} {selectedReferral.lastName[0]}.
                      </div>
                      <div className="contact-company">{selectedReferral.company}</div>
                    </div>
                  </Card>
                  <Form.Text className="text-muted">
                    Click to view this contact's profile
                  </Form.Text>
                </div>
              )}
            </Form.Group>

            {/* More fields can be added here later */}
            
            <div className="d-flex gap-2 mt-4">
              <Button variant="success" onClick={handleSaveContact}>
                Save Contact
              </Button>
              <Button variant="outline-secondary" onClick={handleCloseEdit}>
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      </div>
    );
  }

  // Render list view
  return (
    <div className="contacts-container">
      {/* Header */}
      <div className="d-flex mb-3 align-items-center">
        <h2 className="mb-0">Contacts</h2>
        <Button variant="success" className="ms-auto" onClick={handleOpenAddContact}>
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
            <Card 
              className="contact-card-horizontal"
              onClick={() => handleOpenEditContact(contact)}
              style={{ cursor: "pointer" }}
            >
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
    </div>
  );
}