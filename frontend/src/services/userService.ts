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
  const signUpAttempt = await signUp.create({
    emailAddress: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
  })

  let clerkUserId = signUpAttempt.createdUserId
  if (!clerkUserId && signUpAttempt.status === "missing_requirements") {
    await signUpAttempt.verifications.emailAddress.verifyEmailCode({
      code: "424242",
    })
    clerkUserId = signUpAttempt.createdUserId
  }

  clerkUserId =
    clerkUserId ||
    'dev_' + crypto.randomUUID().replace(/-/g, '').slice(0, 12)

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
