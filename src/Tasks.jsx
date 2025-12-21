import React, { useState } from "react";
import { Button, Modal, Form, Card, Row, Col } from "react-bootstrap";
import "./App.css";

export default function Tasks() {
  const [taskList, setTaskList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [fadingTasks, setFadingTasks] = useState(new Set());
  const [newTask, setNewTask] = useState({
    title: "",
    dueDate: "",
  });

  // Handlers
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNewTask({ title: "", dueDate: "" });
  };

  const handleTaskChange = (e) => {
    setNewTask({
      ...newTask,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddTask = () => {
    if (newTask.title.trim() === "") return;
    
    const id = taskList.length + 1; 
    setTaskList([...taskList, { id, ...newTask, completed: false }]);
    setNewTask({ title: "", dueDate: "" });
    handleCloseModal();
  };

  const handleToggleComplete = (id) => {
    // Add task to fading set
    setFadingTasks(new Set(fadingTasks).add(id));
    
    // Remove task after animation completes
    setTimeout(() => {
      setTaskList(taskList.filter((task) => task.id !== id));
      setFadingTasks((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300); 
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
        {sortedTasks.map((task) => (
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
                  {task.dueDate && (
                    <div className="task-due-date">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        ))}

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
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Due Date</Form.Label>
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
          <Button variant="success" onClick={handleAddTask}>
            Save Task
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}