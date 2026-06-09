export async function createUserWithRole(
  signUp: any,
  data: {
    email: string
    password: string
    role: 'applicant' | 'human_resources' | 'authorities'
    firstName: string
    lastName: string
  }
) {
  // 1. Crear usuario en Clerk
  const response = await signUp.create({
    emailAddress: data.email,
    password: data.password,
  })

  const clerkUserId = response.id

  // 2. Registrar usuario en el backend (crea registro en DB)
  const registerResponse = await fetch('/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clerk_user_id: clerkUserId,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      role: data.role,
    }),
  })

  if (!registerResponse.ok) {
    const errorBody = await registerResponse.json().catch(() => null)
    const detail = errorBody?.detail
    const message = Array.isArray(detail)
      ? detail.map((d: any) => d.msg).join('; ')
      : detail || 'Error al registrar el usuario'
    throw new Error(message)
  }

  const registerData = await registerResponse.json()
  return { clerkUserId, ...registerData }
}
