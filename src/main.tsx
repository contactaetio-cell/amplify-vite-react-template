
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.css";
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json'; 

Amplify.configure(outputs);

createRoot(document.getElementById("root")!).render(<App />);

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

