import React from 'react';
import { Button, Container, Card } from 'react-bootstrap';
import { auth } from './main.jsx';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function Auth() {
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      alert('Failed to sign in. Please try again.');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '400px', padding: '30px' }}>
        <Card.Body className="text-center">
          <h2 className="mb-4">Welcome to NetworkGo</h2>
          <p className="text-muted mb-4">Sign in to manage your contacts and tasks</p>
          <Button 
            variant="primary" 
            size="lg" 
            className="w-100"
            onClick={handleGoogleSignIn}
          >
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 18 18" 
              fill="currentColor" 
              style={{ marginRight: '10px', verticalAlign: 'middle' }}
            >
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.183l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853"/>
              <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z" fill="#FBBC05"/>
              <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.039-3.71z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}