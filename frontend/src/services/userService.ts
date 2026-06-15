type SignUpClient = {
  id?: string | null
  createdUserId?: string | null
  create: (params: {
    emailAddress: string
    password: string
  }) => Promise<{ error?: { message?: string } | null }>
}

type UserRoleData = {
  email: string
  password: string
  role: string
  firstName: string
  lastName: string
}

type OAuthUser = {
  id?: string
  firstName?: string | null
  lastName?: string | null
  externalAccounts?: ReadonlyArray<{ provider?: string | null }> | null
  emailAddresses?: ReadonlyArray<{ emailAddress?: string | null }> | null
}

export async function createUserWithRole(
  signUp: SignUpClient | null | undefined,
  data: UserRoleData
) {
  if (!signUp) {
    throw new Error('Sign up service is not available')
  }

  const { error } = await signUp.create({
    emailAddress: data.email,
    password: data.password,
  })

  if (error) {
    throw new Error(error.message || 'Error creating account')
  }

  const clerkUserId = signUp.createdUserId || signUp.id
  console.log('Registration clerkUserId:', { signUpId: signUp.id, createdUserId: signUp.createdUserId, used: clerkUserId })

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

  const roleData: unknown = await roleResponse.json()

  if (typeof roleData === 'object' && roleData !== null) {
    return { clerkUserId, ...roleData }
  }

  return { clerkUserId }
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

export async function handleOAuthUser(user: OAuthUser) {
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
