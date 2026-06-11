export async function createUserWithRole(
  signUp: any,
  data: { email: string; password: string; role: string; firstName: string; lastName: string }
) {
  const { error } = await signUp.create({
    emailAddress: data.email,
    password: data.password,
  })

  if (error) {
    throw new Error(error.message || 'Error creating account')
  }

  const clerkUserId = signUp.id || signUp.createdUserId

  const roleResponse = await fetch('/api/v1/users/set-role', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clerkUserId,
      role: data.role,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    }),
  })

  if (!roleResponse.ok) {
    throw new Error('Error al asignar el rol del usuario')
  }

  const roleData = await roleResponse.json()
  return { clerkUserId, ...roleData }
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

export async function handleOAuthUser(user: any) {
  const provider = user?.externalAccounts?.[0]?.provider;

  let role = "applicant";

  if (provider === "google" || provider === "linkedin") {
    role = "applicant";
  }
  else if (provider === "oauth_microsoft") {
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
