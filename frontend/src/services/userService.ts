export async function createUserWithRole(
  signUp: any,
  data: { email: string; password: string; role: string; firstName: string; lastName: string }
) {
  // 1. Crear usuario en Clerk
  const { error } = await signUp.create({
    emailAddress: data.email,
    password: data.password,
  })

  if (error) {
    throw new Error(error.message || 'Error creating account')
  }

  const clerkUserId = signUp.id || signUp.createdUserId

  // 2. Asignar rol en el backend
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
