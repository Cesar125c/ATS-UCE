export async function createUserWithRole(
  signUp: any,
  data: { email: string; password: string; role: string }
) {
  // 1. Crear usuario en Clerk
  const response = await signUp.create({
    emailAddress: data.email,
    password: data.password,
  })

  const clerkUserId = response.id

  // 2. Asignar rol en el backend
  const roleResponse = await fetch('/api/users/set-role', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clerkUserId,
      role: data.role,
    }),
  })

  if (!roleResponse.ok) {
    throw new Error('Error al asignar el rol del usuario')
  }

  const roleData = await roleResponse.json()
  return { clerkUserId, ...roleData }
}
