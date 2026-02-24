import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json'; 

Amplify.configure(outputs);
export default function App() {
  return (
    <Authenticator.Provider>
      <RouterProvider router={router} />
    </Authenticator.Provider>
  );
}