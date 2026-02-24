import React from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
// Import your auto-generated outputs file
import outputs from "../amplify_outputs.json";

import Landing from "./app/screens/Landing";
// Configure Amplify
Amplify.configure(outputs);

export default function App() {
  return <Landing />;
}
