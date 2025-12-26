
import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Card, Row, Col } from "react-bootstrap";
import { database } from "./main.jsx";
import { ref, set, onValue, remove } from "firebase/database";
import "./App.css";

export default function Tasks({ data, user }) {
  const [taskList, setTaskList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [fadingTasks, setFadingTasks] = useState(new Set());
  const [newTask, setNewTask] = useState({
    title: "",
    dueDate: "",
    contactId: "",
  });

  const contactList = data?.contacts || [];

  // Load tasks from Firebase
  useEffect(() => {
    if (!user) return;

    const tasksRef = ref(database, `users/${user.uid}/tasks`);
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const tasksArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setTaskList(tasksArray);
      } else {
        setTaskList([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Handlers
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNewTask({ title: "", dueDate: "", contactId: "" });
  };

  const handleTaskChange = (e) => {
    setNewTask({
      ...newTask,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddTask = async () => {
    if (newTask.title.trim() === "" || !user) return;
    
    const taskId = Date.now().toString();
    const taskRef = ref(database, `users/${user.uid}/tasks/${taskId}`);
    
    try {
      await set(taskRef, {
        title: newTask.title,
        dueDate: newTask.dueDate,
        contactId: newTask.contactId,
        completed: false,
        createdAt: Date.now(),
      });
      setNewTask({ title: "", dueDate: "", contactId: "" });
      handleCloseModal();
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task. Please try again.");
    }
  };

  const handleToggleComplete = async (id) => {
    if (!user) return;

    // Add task to fading set
    setFadingTasks(new Set(fadingTasks).add(id));
    
    // Remove task after animation completes
    setTimeout(async () => {
      const taskRef = ref(database, `users/${user.uid}/tasks/${id}`);
      try {
        await remove(taskRef);
        setFadingTasks((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } catch (error) {
        console.error("Error removing task:", error);
        setFadingTasks((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    }, 300); 
  };

  // Get contact name by ID
  const getContactName = (contactId) => {
    if (!contactId) return null;
    const contact = contactList.find(c => c.id === contactId);
    if (!contact) return null;
    return `${contact.firstName} ${contact.lastName[0]}.`;
  };

  // Sort tasks by due date
  const sortedTasks = [...taskList].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  return (
    <div className="contacts-container">
      {/* Header */}
      <div className="d-flex mb-3 align-items-left">
        <h2 className="mb-0">To Do</h2>
        <Button variant="success" className="ms-auto" onClick={handleOpenModal}>
          +
        </Button>
      </div>

      {/* Task cards */}
      <Row className="tasks-list">
        {sortedTasks.map((task) => {
          const contactName = getContactName(task.contactId);
          return (
            <Col key={task.id} xs={12} className="d-flex justify-content-center mb-3">
              <Card className={`task-card-horizontal ${fadingTasks.has(task.id) ? 'fading' : ''}`}>
                <div className="d-flex align-items-center w-100">
                  <Form.Check
                    type="checkbox"
                    className="me-3"
                    onChange={() => handleToggleComplete(task.id)}
                  />
                  <div className="task-info flex-grow-1">
                    <div className="task-title">{task.title}</div>
                    {contactName && (
                      <div className="task-contact" style={{ fontSize: "0.875rem", color: "#6c757d", marginTop: "4px" }}>
                        👤 {contactName}
                      </div>
                    )}
                    {task.dueDate && (
                      <div className="task-due-date">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}

        {taskList.length === 0 && (
          <div className="text-center text-muted" style={{ width: "100%" }}>
            No tasks available.
          </div>
        )}
      </Row>

      {/* Add Task Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Task</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Task Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={newTask.title}
                onChange={handleTaskChange}
                placeholder="Enter task title..."
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Associated Contact (Optional)</Form.Label>
              <Form.Select
                name="contactId"
                value={newTask.contactId}
                onChange={handleTaskChange}
              >
                <option value="">None</option>
                {contactList.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName} 
                    {contact.company && ` - ${contact.company}`}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                {contactList.length === 0 
                  ? "Add contacts first to associate them with tasks"
                  : "Select a contact to link this task to"}
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Due Date (Optional)</Form.Label>
              <Form.Control
                type="date"
                name="dueDate"
                value={newTask.dueDate}
                onChange={handleTaskChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleAddTask}>
            Add Task
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}