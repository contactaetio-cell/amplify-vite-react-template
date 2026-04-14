import { Authenticator } from "@aws-amplify/ui-react";
import { Navigate } from "react-router";
import '@aws-amplify/ui-react/styles.css';
import { useNavigate } from "react-router";
import { mockScreenPaths } from "../screens-mock/routesMock";
import { useResolvedAuthStatus } from "../../useResolvedAuthStatus";

export default function Login() {
  const authStatus = useResolvedAuthStatus();
  const navigate = useNavigate();

  if (authStatus === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-aetio-blue-950 flex flex-col relative">
      <button
        onClick={() => {
          console.log("mock");
          navigate(mockScreenPaths.home);
        }}
        className="absolute top-6 right-6 bg-white text-black px-4 py-2 border border-black rounded"
      >
        Go to mock screen
      </button>

      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        {authStatus === "loading" ? (
          <div className="text-white text-sm tracking-wide">Checking your session...</div>
        ) : (
          <Authenticator
            socialProviders={["google", "CustomOIDC"]}
            signUpAttributes={["name"]}
          />
        )}
      </div>
    </div>
  );
}
