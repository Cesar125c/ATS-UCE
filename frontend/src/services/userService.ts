interface ClerkUser {
  id: string
  firstName?: string | null
  lastName?: string | null
  emailAddresses?: { emailAddress: string }[]
  externalAccounts?: { provider: string }[]
  publicMetadata?: Record<string, unknown>
}

async function registerUserInBackend(data: {
  clerkUserId: string
  firstName: string
  lastName: string
  email: string
  role: string
}) {
  const response = await fetch('/api/v1/users/set-role', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (response.status === 409) {
    return null
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || 'Error al registrar usuario en el backend')
  }

  return await response.json()
}

export async function createUserWithRole(
  signUp: any,
  data: {
    firstName: string
    lastName: string
    email: string
    password: string
    role: string
  }
) {
  const response = await signUp.create({
    emailAddress: data.email,
    password: data.password,
  })

  await signUp.prepareEmailAddressVerification()

  await signUp.attemptEmailAddressVerification({ code: '424242' })

  const clerkUserId = response.id

  const result = await registerUserInBackend({
    clerkUserId,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    role: data.role,
  })

  return { clerkUserId, ...result }
}

export async function assignUserRole(clerkUser: ClerkUser, role: string) {
  const result = await registerUserInBackend({
    clerkUserId: clerkUser.id,
    firstName: clerkUser.firstName || '',
    lastName: clerkUser.lastName || '',
    email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
    role,
  })

  if (result === null) {
    return { clerkUserId: clerkUser.id, role }
  }

  return { clerkUserId: clerkUser.id, ...result }
}

export async function handleOAuthUser(user: ClerkUser) {
  const provider = user?.externalAccounts?.[0]?.provider

  let role = 'applicant'

  if (provider === 'google' || provider === 'linkedin' || provider === 'microsoft') {
    role = 'applicant'
  }

  const result = await registerUserInBackend({
    clerkUserId: user.id,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.emailAddresses?.[0]?.emailAddress || '',
    role,
  })

  if (result === null) {
    return { clerkUserId: user.id, role }
  }

  return { clerkUserId: user.id, ...result }
}
