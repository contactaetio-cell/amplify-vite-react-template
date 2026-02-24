import { motion } from "motion/react";
import { Link } from "react-router";
import { Logo } from "../components/Logo";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building2,
  ArrowRight,
  Shield,
} from "lucide-react";

import { Authenticator } from "@aws-amplify/ui-react";
import { Navigate } from "react-router";
import { useAuthenticator } from "@aws-amplify/ui-react";
import '@aws-amplify/ui-react/styles.css';
import { useNavigate } from "react-router";

export default function Login() {
  const { authStatus } = useAuthenticator((c) => [c.authStatus]);
  const navigate = useNavigate();

  if (authStatus === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    
    <div className="min-h-screen bg-aetio-blue-950 flex flex-col">
      <button
      onClick={() => {console.log("mock"); navigate("/mock/dashboard");}}
      style={{
        backgroundColor: "white",
        color: "black",
        padding: "10px 16px",
        border: "1px solid black",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: 500
      }}
    >
      Go to mock screen
    </button>
      <div className="flex-1 flex items-center justify-center px-6 pb-16">

        <Authenticator
        socialProviders={["google"]}
        signUpAttributes={["name"]}
      />
    </div>
    </div>
  );
}