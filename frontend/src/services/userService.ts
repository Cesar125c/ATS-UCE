function generateId(): string {
  return 'dev_' + crypto.randomUUID().replace(/-/g, '').slice(0, 12)
}

export async function createUserWithRole(
  _signUp: any,
  data: {
    email: string
    password: string
    role: 'applicant' | 'human_resources' | 'authorities'
    firstName: string
    lastName: string
  }
) {
  const clerkUserId = generateId()

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
