
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.css";
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json'; 

import type { Schema } from "../amplify/data/resource"
import { generateClient } from "aws-amplify/api"

Amplify.configure(outputs);

createRoot(document.getElementById("root")!).render(<App />);

const client = generateClient<Schema>()

client.queries.sayHello({
  name: "Amplify",
})
// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App.tsx";
// import "./index.css";
// import { Amplify } from "aws-amplify";
// import outputs from "../amplify_outputs.json";

// Amplify.configure(outputs);

// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

