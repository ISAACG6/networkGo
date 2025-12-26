import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'  // ADD THIS
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import App from './App.jsx'

const firebaseConfig = {
  apiKey: "AIzaSyBJ2d7yWRJ3ZEvvssxngf9EDi6MSCKjHRE",
  authDomain: "networkgo-49648.firebaseapp.com",
  projectId: "networkgo-49648",
  storageBucket: "networkgo-49648.firebasestorage.app",
  messagingSenderId: "205822291920",
  appId: "1:205822291920:web:e89465b5f057682c5f53d5",
  databaseURL: "https://networkgo-49648-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);  // ADD THIS EXPORT

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
