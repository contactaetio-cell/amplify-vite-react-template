import { Navigate } from "react-router";
import { useResolvedAuthStatus } from "./useResolvedAuthStatus";

export default function AuthGate({ children }: { children: JSX.Element }) {
  const authStatus = useResolvedAuthStatus();

  if (authStatus === "loading") return null;

  if (authStatus !== "authenticated") {
    return <Navigate to="/" replace />;
  }

  return children;
}
