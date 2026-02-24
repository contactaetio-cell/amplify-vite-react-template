// AuthGate.tsx
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Navigate } from "react-router";

export default function AuthGate({ children }: { children: JSX.Element }) {
  const { authStatus } = useAuthenticator(context => [context.authStatus]);

  if (authStatus === "configuring") return null;

  if (authStatus !== "authenticated") {
    return <Navigate to="/" replace />;
  }

  return children;
}