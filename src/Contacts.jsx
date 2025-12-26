import React, { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { Button, Tabs, Tab } from "react-bootstrap";
import { database } from "./main.jsx";
import { ref, set, onValue, remove } from "firebase/database";
import "./App.css";

export default function Contacts({ user, data, setData }) {
  const [contactList, setContactList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("list");
  const [editingContact, setEditingContact] = useState(null);
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    company: "",
    referredBy: "",
  });
  const [showReferralDropdown, setShowReferralDropdown] = useState(false);
  const [referralSearch, setReferralSearch] = useState("");
  const [meetingHistory, setMeetingHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("details");

  // Load contacts from Firebase
  useEffect(() => {
    if (!user) return;

    const contactsRef = ref(database, `users/${user.uid}/contacts`);
    const unsubscribe = onValue(contactsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const contactsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setContactList(contactsArray);
        if (setData) {
          setData({ contacts: contactsArray });
        }
      } else {
        setContactList([]);
        if (setData) {
          setData({ contacts: [] });
        }
      }
    });

    return () => unsubscribe();
  }, [user, setData]);

  // Load meeting history for the selected contact
  useEffect(() => {
    if (!user || !editingContact) {
      setMeetingHistory([]);
      return;
    }

    const historyRef = ref(database, `users/${user.uid}/contacts/${editingContact.id}/meetingHistory`);
    const unsubscribe = onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const historyArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        })).sort((a, b) => b.archivedAt - a.archivedAt); // Most recent first
        setMeetingHistory(historyArray);
      } else {
        setMeetingHistory([]);
      }
    });

    return () => unsubscribe();
  }, [user, editingContact]);

  // Handlers
  const handleOpenAddContact = () => {
    setEditingContact(null);
    setContactForm({ firstName: "", lastName: "", company: "", referredBy: "" });
    setReferralSearch("");
    setMeetingHistory([]);
    setActiveTab("details");
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
    setActiveTab("details");
    setCurrentView("edit");
  };

  const handleCloseEdit = () => {
    setCurrentView("list");
    setEditingContact(null);
    setContactForm({ firstName: "", lastName: "", company: "", referredBy: "" });
    setReferralSearch("");
    setShowReferralDropdown(false);
    setMeetingHistory([]);
    setActiveTab("details");
  };

  const handleContactChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveContact = async () => {
    if (!user || contactForm.firstName.trim() === "" || contactForm.lastName.trim() === "") {
      alert("Please fill in first and last name");
      return;
    }

    try {
      if (editingContact) {
        const contactRef = ref(database, `users/${user.uid}/contacts/${editingContact.id}`);
        await set(contactRef, {
          firstName: contactForm.firstName,
          lastName: contactForm.lastName,
          company: contactForm.company,
          referredBy: contactForm.referredBy,
          meetingHistory: editingContact.meetingHistory || {},
          updatedAt: Date.now(),
        });
      } else {
        const contactId = Date.now().toString();
        const contactRef = ref(database, `users/${user.uid}/contacts/${contactId}`);
        await set(contactRef, {
          firstName: contactForm.firstName,
          lastName: contactForm.lastName,
          company: contactForm.company,
          referredBy: contactForm.referredBy,
          createdAt: Date.now(),
        });
      }
      handleCloseEdit();
    } catch (error) {
      console.error("Error saving contact:", error);
      alert("Failed to save contact. Please try again.");
    }
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
    setContactForm({ ...contactForm, referredBy: value });
    setShowReferralDropdown(true);
  };

  const handleReferralBlur = () => {
    setTimeout(() => {
      setShowReferralDropdown(false);
    }, 200);
  };

  const handleClickReferralCard = (contact) => {
    handleOpenEditContact(contact);
  };

  const availableReferrals = contactList.filter(
    (c) => c.id !== editingContact?.id
  );

  const filteredReferrals = referralSearch.trim() === ""
    ? availableReferrals
    : availableReferrals.filter((contact) => {
        const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
        const company = (contact.company || "").toLowerCase();
        const term = referralSearch.toLowerCase();
        return fullName.includes(term) || company.includes(term);
      });

  const selectedReferral = contactForm.referredBy
    ? contactList.find((c) => c.id === contactForm.referredBy)
    : null;

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value || "");
  };

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

        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
          <Tab eventKey="details" title="Details">
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
                  <div className="referral-dropdown-container">
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
                        className="clear-referral-btn"
                      >
                        ×
                      </Button>
                    )}
                    {showReferralDropdown && availableReferrals.length > 0 && (
                      <div className="referral-dropdown">
                        {filteredReferrals.length > 0 ? (
                          filteredReferrals.map((contact) => (
                            <div
                              key={contact.id}
                              onClick={() => handleSelectReferral(contact)}
                              className={`referral-dropdown-item ${contactForm.referredBy === contact.id ? 'selected' : ''}`}
                            >
                              <div className="referral-name">
                                {contact.firstName} {contact.lastName}
                              </div>
                              {contact.company && (
                                <div className="referral-company">
                                  {contact.company}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="referral-dropdown-empty">
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
                  
                  {selectedReferral && (
                    <div className="mt-3">
                      <Card 
                        className="contact-card-horizontal"
                        onClick={() => handleClickReferralCard(selectedReferral)}
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
          </Tab>

          {editingContact && (
            <Tab eventKey="history" title={`Meeting History (${meetingHistory.length})`}>
              <div className="meeting-history-container">
                {meetingHistory.length === 0 ? (
                  <div className="text-center text-muted mt-4">
                    No meeting history available.
                  </div>
                ) : (
                  <div className="meeting-history-list">
                    {meetingHistory.map((meeting) => (
                      <Card key={meeting.id} className="mb-3">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h5 className="mb-1">{meeting.topic}</h5>
                              <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                                {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                              </div>
                            </div>
                          </div>
                          {meeting.notes && (
                            <div className="mt-3">
                              <strong>Notes:</strong>
                              <div className="meeting-notes mt-2" style={{ whiteSpace: "pre-wrap" }}>
                                {meeting.notes}
                              </div>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Tab>
          )}
        </Tabs>
      </div>
    );
  }

  // Render list view
  return (
    <div className="contacts-container">
      <div className="d-flex mb-3 align-items-center">
        <h2 className="mb-0">Contacts</h2>
        <Button variant="success" className="ms-auto" onClick={handleOpenAddContact}>
          Add Contact
        </Button>
      </div>

      <Form className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search by name or company..."
          value={searchTerm}
          onChange={handleSearchChange}
          disabled={contactList.length === 0}
        />
      </Form>

      <Row className="contacts-list">
        {filteredContacts.map((contact) => (
          <Col key={contact.id} xs={12} className="d-flex justify-content-center mb-3">
            <Card 
              className="contact-card-horizontal"
              onClick={() => handleOpenEditContact(contact)}
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
          <div className="text-center text-muted">
            No contacts available.
          </div>
        )}

        {filteredContacts.length === 0 && contactList.length > 0 && (
          <div className="text-center text-muted">
            No contacts match your search.
          </div>
        )}
      </Row>
    </div>
  );
}