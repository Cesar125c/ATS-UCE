import type { SignUpFutureResource, UserResource } from '@clerk/shared/types'

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

  // Call Clerk signUp.create and handle different response shapes across SDK versions
  let createResult: any;
  try {
    createResult = await signUp.create({
      emailAddress: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
    });
  } catch (e: any) {
    const msg = e?.message || "Error creating account";
    throw new Error(msg);
  }

  // Some SDKs return an object with `error` or `errors`, others return `createdUserId`/`status`.
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

  const roleResponse = await fetch("/api/v1/users/set-role", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clerkUserId,
      role: data.role,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    }),
  });

  if (!roleResponse.ok) {
    throw new Error("Error al asignar el rol del usuario");
  }

  const roleData = await roleResponse.json();
  return { clerkUserId, ...roleData };
}

export async function assignUserRole(clerkUserId: string, role: string, email: string) {
  const roleResponse = await fetch("/api/v1/users/set-role", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clerkUserId,
      role,
      email,
      firstName: "",
      lastName: "",
    }),
  });

  if (!roleResponse.ok) {
    throw new Error("Error al asignar el rol del usuario");
  }

  return await roleResponse.json();
}

export async function handleOAuthUser(user: UserResource) {
  const provider = user?.externalAccounts?.[0]?.provider;

  let role = "applicant";

  if (provider === "google" || provider === "linkedin") {
    role = "applicant";
  }
  else if (provider === "microsoft") {
    const email = user?.emailAddresses?.[0]?.emailAddress;

    if (email?.endsWith("@uce.edu.ec")) {
      role = "applicant";
    } else {
      role = "applicant";
    }
  }

  const clerkUserId = user?.id;
  const email = user?.emailAddresses?.[0]?.emailAddress || "";
  const roleResponse = await fetch("/api/v1/users/set-role", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clerkUserId,
      role,
      email,
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    }),
  });

  if (!roleResponse.ok) {
    throw new Error("Error al asignar el rol del usuario");
  }

  return { clerkUserId, role };
}
