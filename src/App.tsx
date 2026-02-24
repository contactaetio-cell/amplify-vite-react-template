import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Authenticator } from "@aws-amplify/ui-react";

export default function App() {
  return (
    <Authenticator.Provider>
      <RouterProvider router={router} />
    </Authenticator.Provider>
  );
}