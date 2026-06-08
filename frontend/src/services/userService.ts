const ROLE_MAP: Record<string, string> = {
  applicant: "applicant",
  hr_staff: "hr_staff",
  authority: "authority",
}

export async function createUserWithRole(
  signUp: any,
  data: { email: string; password: string; role: string }
) {
  const response = await signUp.create({
    emailAddress: data.email,
    password: data.password,
  })

  const clerkUserId = response.id
  const backendRole = ROLE_MAP[data.role] ?? data.role

  const baseUrl = import.meta.env.VITE_API_URL ?? ""
  const roleResponse = await fetch(`${baseUrl}/api/v1/users/set-role`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clerk_user_id: clerkUserId,
      role: backendRole,
    }),
  })

  if (!roleResponse.ok) {
    throw new Error("Error al asignar el rol del usuario")
  }

  const roleData = await roleResponse.json()
  return { clerkUserId, ...roleData }
}
