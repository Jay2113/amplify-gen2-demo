"use client";

import {
  Authenticator,
  useAuthenticator,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";

const SignIn = () => {
  const router = useRouter();
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  if (authStatus === "authenticated") {
    router.push("/");
  }

  return <Authenticator />;
};

export default withAuthenticator(SignIn);
