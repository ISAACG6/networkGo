import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import React from "react";

export default function Contacts({ data }) {
  const { contacts } = data;

  const renderContactCards = () =>
    contacts.map((contact) => (
      <Col key={contact.id} xs={12} md={6} className="mb-3">
        <Card>
          <Card.Body>
            <Card.Title>
              {contact.firstName} {contact.lastName}
            </Card.Title>

            <Card.Subtitle className="mb-2 text-muted">
              {contact.role}
            </Card.Subtitle>

            <Card.Text>
              <strong>Company:</strong> {contact.company}
              <br />
              <strong>Introduced by:</strong> {contact.introducedBy}
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    ));

  return (
    <div>
      <h2 className="mb-3">Contacts</h2>

      <Row>
        {renderContactCards()}
      </Row>
    </div>
  );
}
