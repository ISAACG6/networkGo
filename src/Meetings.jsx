import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Card, Row, Col } from "react-bootstrap";
import { database } from "./main.jsx";
import { ref, set, onValue, remove, update } from "firebase/database";
import "./App.css";

export default function Calendar({ data, user }) {
  const [meetingList, setMeetingList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [newMeeting, setNewMeeting] = useState({
    topic: "",
    date: "",
    time: "",
    contactId: "",
  });
  const [meetingNotes, setMeetingNotes] = useState("");

  const contactList = data?.contacts || [];

  // Load meetings from Firebase and check for expired ones
  useEffect(() => {
    if (!user) return;

    const meetingsRef = ref(database, `users/${user.uid}/meetings`);
    const unsubscribe = onValue(meetingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const now = new Date();
        const meetingsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        // Check for expired meetings (2 hours after meeting time)
        meetingsArray.forEach((meeting) => {
          const meetingDateTime = new Date(`${meeting.date}T${meeting.time}`);
          const twoHoursAfter = new Date(meetingDateTime.getTime() + 2 * 60 * 60 * 1000);
          
          if (now >= twoHoursAfter && !meeting.archived) {
            // Archive the meeting (move to contact's history)
            archiveMeeting(meeting);
          }
        });

        // Filter out archived meetings
        const activeMeetings = meetingsArray.filter((m) => !m.archived);
        setMeetingList(activeMeetings);
      } else {
        setMeetingList([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const archiveMeeting = async (meeting) => {
    if (!meeting.contactId || !user) return;

    try {
      // Add to contact's meeting history
      const historyId = Date.now().toString();
      const historyRef = ref(
        database,
        `users/${user.uid}/contacts/${meeting.contactId}/meetingHistory/${historyId}`
      );
      
      await set(historyRef, {
        topic: meeting.topic,
        date: meeting.date,
        time: meeting.time,
        notes: meeting.notes || "",
        archivedAt: Date.now(),
      });

      // Mark meeting as archived
      const meetingRef = ref(database, `users/${user.uid}/meetings/${meeting.id}`);
      await update(meetingRef, { archived: true });

      // Remove the meeting
      await remove(meetingRef);
    } catch (error) {
      console.error("Error archiving meeting:", error);
    }
  };

  const getUrgencyLevel = (date, time) => {
    const now = new Date();
    const meetingDateTime = new Date(`${date}T${time}`);
    const diffInDays = (meetingDateTime - now) / (1000 * 60 * 60 * 24);

    if (diffInDays < 0) return "expired";
    if (diffInDays <= 2) return "urgent"; // Red - within 2 days
    if (diffInDays <= 7) return "soon"; // Orange/Yellow - within a week
    return "normal"; // Green - more than a week
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "urgent":
        return "#dc3545"; // Red
      case "soon":
        return "#fd7e14"; // Orange
      case "normal":
        return "#28a745"; // Green
      default:
        return "#6c757d"; // Gray
    }
  };

  const handleOpenAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewMeeting({ topic: "", date: "", time: "", contactId: "" });
  };

  const handleMeetingChange = (e) => {
    setNewMeeting({
      ...newMeeting,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddMeeting = async () => {
    if (newMeeting.topic.trim() === "" || !newMeeting.date || !user) {
      alert("Please fill in topic and date");
      return;
    }

    const meetingId = Date.now().toString();
    const meetingRef = ref(database, `users/${user.uid}/meetings/${meetingId}`);

    try {
      await set(meetingRef, {
        topic: newMeeting.topic,
        date: newMeeting.date,
        time: newMeeting.time || "12:00",
        contactId: newMeeting.contactId,
        notes: "",
        createdAt: Date.now(),
        archived: false,
      });
      handleCloseAddModal();
    } catch (error) {
      console.error("Error adding meeting:", error);
      alert("Failed to add meeting. Please try again.");
    }
  };

  const handleOpenDetail = (meeting) => {
    setSelectedMeeting(meeting);
    setMeetingNotes(meeting.notes || "");
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedMeeting(null);
    setMeetingNotes("");
  };

  const handleSaveNotes = async () => {
    if (!selectedMeeting || !user) return;

    const meetingRef = ref(database, `users/${user.uid}/meetings/${selectedMeeting.id}`);
    try {
      await update(meetingRef, { notes: meetingNotes });
      handleCloseDetail();
    } catch (error) {
      console.error("Error saving notes:", error);
      alert("Failed to save notes. Please try again.");
    }
  };

  const handleDeleteMeeting = async () => {
    if (!selectedMeeting || !user) return;

    if (window.confirm("Are you sure you want to delete this meeting?")) {
      const meetingRef = ref(database, `users/${user.uid}/meetings/${selectedMeeting.id}`);
      try {
        await remove(meetingRef);
        handleCloseDetail();
      } catch (error) {
        console.error("Error deleting meeting:", error);
        alert("Failed to delete meeting. Please try again.");
      }
    }
  };

  const getContactName = (contactId) => {
    if (!contactId) return "No contact";
    const contact = contactList.find((c) => c.id === contactId);
    if (!contact) return "Unknown contact";
    return `${contact.firstName} ${contact.lastName}`;
  };

  // Sort meetings by date and time
  const sortedMeetings = [...meetingList].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA - dateB;
  });

  return (
    <div className="contacts-container">
      <div className="d-flex mb-3 align-items-left">
        <h2 className="mb-0">Meetings</h2>
        <Button variant="success" className="ms-auto" onClick={handleOpenAddModal}>
          +
        </Button>
      </div>

      <Row className="meetings-list">
        {sortedMeetings.map((meeting) => {
          const urgency = getUrgencyLevel(meeting.date, meeting.time);
          const borderColor = getUrgencyColor(urgency);
          const contactName = getContactName(meeting.contactId);

          return (
            <Col key={meeting.id} xs={12} className="d-flex justify-content-center mb-3">
              <Card
                className="meeting-card"
                onClick={() => handleOpenDetail(meeting)}
                style={{ borderLeft: `4px solid ${borderColor}` }}
              >
                <div className="meeting-info">
                  <div className="meeting-topic">{meeting.topic}</div>
                  <div className="meeting-contact">{contactName}</div>
                  <div className="meeting-datetime">
                    {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                  </div>
                  {meeting.notes && (
                    <div className="meeting-has-notes">📝 Has notes</div>
                  )}
                </div>
              </Card>
            </Col>
          );
        })}

        {meetingList.length === 0 && (
          <div className="text-center text-muted" style={{ width: "100%" }}>
            No upcoming meetings.
          </div>
        )}
      </Row>

      {/* Add Meeting Modal */}
      <Modal show={showAddModal} onHide={handleCloseAddModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Meeting</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Topic</Form.Label>
              <Form.Control
                type="text"
                name="topic"
                value={newMeeting.topic}
                onChange={handleMeetingChange}
                placeholder="Meeting topic..."
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contact (Optional)</Form.Label>
              <Form.Select
                name="contactId"
                value={newMeeting.contactId}
                onChange={handleMeetingChange}
              >
                <option value="">None</option>
                {contactList.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName}
                    {contact.company && ` - ${contact.company}`}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={newMeeting.date}
                onChange={handleMeetingChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Time</Form.Label>
              <Form.Control
                type="time"
                name="time"
                value={newMeeting.time}
                onChange={handleMeetingChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleAddMeeting}>
            Add Meeting
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Meeting Detail Modal */}
      {selectedMeeting && (
        <Modal show={showDetailModal} onHide={handleCloseDetail} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{selectedMeeting.topic}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <div className="mb-3">
              <strong>Contact:</strong> {getContactName(selectedMeeting.contactId)}
            </div>
            <div className="mb-3">
              <strong>Date & Time:</strong>{" "}
              {new Date(selectedMeeting.date).toLocaleDateString()} at{" "}
              {selectedMeeting.time}
            </div>

            <Form.Group>
              <Form.Label>
                <strong>Meeting Notes</strong>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                placeholder="Add notes about this meeting..."
              />
              <Form.Text className="text-muted">
                Notes will be saved to the contact's meeting history after the meeting ends.
              </Form.Text>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="danger" onClick={handleDeleteMeeting}>
              Delete Meeting
            </Button>
            <Button variant="secondary" onClick={handleCloseDetail}>
              Close
            </Button>
            <Button variant="success" onClick={handleSaveNotes}>
              Save Notes
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}