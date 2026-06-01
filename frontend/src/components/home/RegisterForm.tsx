import { useForm } from 'react-hook-form'
import { Input, Button, Card } from '../ui'

type RegisterFormData = {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>()

  const onSubmit = (data: RegisterFormData) => {
    console.log(data)
  }

  return (
    <Card className="rounded-3xl shadow-2xl w-full max-w-xl p-10">
      <div className="mb-8">
        <h3 className="text-3xl font-bold text-slate-800">
          Create Account
        </h3>

        <p className="text-slate-500 mt-2">
          Register to access ATS-UCE recruitment platform
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {/* First Name */}
        <Input
          type="text"
          label="First Name"
          placeholder="John"
          error={errors.firstName?.message}
          {...register('firstName', {
            required: 'First name is required',
          })}
        />

        {/* Last Name */}
        <Input
          type="text"
          label="Last Name"
          placeholder="Doe"
          error={errors.lastName?.message}
          {...register('lastName', {
            required: 'Last name is required',
          })}
        />

        {/* Email */}
        <Input
          type="email"
          label="Institutional Email"
          placeholder="john.doe@uce.edu.ec"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
          })}
        />

        {/* Password */}
        <Input
          type="password"
          label="Password"
          placeholder="********"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Minimum 8 characters',
            },
          })}
        />

        {/* Confirm Password */}
        <Input
          type="password"
          label="Confirm Password"
          placeholder="********"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
          })}
        />

        {/* Submit */}
        <Button
          type="submit"
          variant="secondary"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
        >
          Create Account
        </Button>
      </form>
    </Card>
  )
}