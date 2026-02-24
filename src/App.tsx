import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
// Import your auto-generated outputs file
import outputs from "../amplify_outputs.json"; 
import Dashboard from './app/Dashboard';
import Landing from './app/screens/Landing';
// Configure Amplify
Amplify.configure(outputs);

export default function App() {
  return (
    <Authenticator>
      {({ user }) => (
        user ? <Dashboard /> : <Landing />
      )}
    </Authenticator>
  );
}
