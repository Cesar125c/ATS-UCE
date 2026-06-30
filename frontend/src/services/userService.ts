import type { SignUpFutureResource, UserResource } from "@clerk/shared/types";
import { apiFetch } from "./api";

type ClerkErrorLike = {
  message?: string;
};

type SignUpCreateResult = Awaited<ReturnType<SignUpFutureResource["create"]>> & {
  createdUserId?: string | null;
  error?: ClerkErrorLike;
  errors?: ClerkErrorLike | ClerkErrorLike[];
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export async function createUserWithRole(
  signUp: SignUpFutureResource | undefined,
  data: {
    email: string;
    password: string;
    role: string;
    firstName: string;
    lastName: string;
  },
) {
  if (!signUp) {
    throw new Error("Clerk sign-up is not ready");
  }

  let createResult: SignUpCreateResult;
  try {
    createResult = await signUp.create({
      emailAddress: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
    }) as SignUpCreateResult;
  } catch (e: unknown) {
    throw new Error(getErrorMessage(e, "Error creating account"), { cause: e });
  }

  if (createResult && (createResult.error || createResult.errors)) {
    const errObj =
      createResult.error ||
      (Array.isArray(createResult.errors)
        ? createResult.errors[0]
        : createResult.errors);
    const msg = (errObj && errObj.message) || "Error creating account";
    throw new Error(msg);
  }

  const clerkUserId =
    createResult?.createdUserId || signUp.createdUserId || signUp.id;
  console.log("Registration clerkUserId:", {
    signUpId: signUp.id,
    createdUserId: createResult?.createdUserId || signUp.createdUserId,
    used: clerkUserId,
    createResult,
  });

  if (!clerkUserId) {
    throw new Error("Unable to determine Clerk user id after signup");
  }

  try {
    const roleData = await apiFetch<Record<string, unknown>>("/api/v1/users/set-role", {
      method: "POST",
      body: JSON.stringify({
        clerkUserId,
        role: data.role,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      }),
    });
    return { clerkUserId, ...roleData };
  } catch {
    throw new Error("Error al asignar el rol del usuario");
  }
}

export async function assignUserRole(clerkUserId: string, role: string, email: string) {
  try {
    return await apiFetch<Record<string, unknown>>("/api/v1/users/set-role", {
      method: "POST",
      body: JSON.stringify({
        clerkUserId,
        role,
        email,
        firstName: "",
        lastName: "",
      }),
    });
  } catch {
    throw new Error("Error al asignar el rol del usuario");
  }
}

export async function handleOAuthUser(user: UserResource) {
  const provider = user?.externalAccounts?.[0]?.provider;

  let role = "applicant";

  if (provider === "google" || provider === "linkedin") {
    role = "applicant";
  } else if (provider === "microsoft") {
    const email = user?.emailAddresses?.[0]?.emailAddress;

    if (email?.endsWith("@uce.edu.ec")) {
      role = "applicant";
    } else {
      role = "applicant";
    }
  }

  const clerkUserId = user?.id;
  const email = user?.emailAddresses?.[0]?.emailAddress || "";

  try {
    await apiFetch("/api/v1/users/set-role", {
      method: "POST",
      body: JSON.stringify({
        clerkUserId,
        role,
        email,
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
      }),
    });
    return { clerkUserId, role };
  } catch {
    throw new Error("Error al asignar el rol del usuario");
  }
}
