import { useAuthenticator } from "@aws-amplify/ui-react";
import { getCurrentUser } from "aws-amplify/auth";
import { useEffect, useRef, useState } from "react";

export type ResolvedAuthStatus = "loading" | "authenticated" | "unauthenticated";

export function useResolvedAuthStatus(): ResolvedAuthStatus {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const [status, setStatus] = useState<ResolvedAuthStatus>(
    authStatus === "authenticated" ? "authenticated" : "loading",
  );
  const hasResolvedInitialStatus = useRef(false);

  useEffect(() => {
    if (authStatus === "authenticated") {
      hasResolvedInitialStatus.current = true;
      setStatus("authenticated");
      return;
    }

    if (authStatus === "configuring") {
      setStatus("loading");
      return;
    }

    let isMounted = true;

    const verifyCurrentUser = async () => {
      try {
        await getCurrentUser();
        if (!isMounted) return;

        hasResolvedInitialStatus.current = true;
        setStatus("authenticated");
      } catch {
        if (!isMounted) return;

        hasResolvedInitialStatus.current = true;
        setStatus("unauthenticated");
      }
    };

    if (!hasResolvedInitialStatus.current) {
      void verifyCurrentUser();
      return () => {
        isMounted = false;
      };
    }

    setStatus("unauthenticated");
    return () => {
      isMounted = false;
    };
  }, [authStatus]);

  return status;
}
