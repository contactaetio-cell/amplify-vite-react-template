
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
