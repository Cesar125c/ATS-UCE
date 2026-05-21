import { useForm } from 'react-hook-form'

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
    formState: { errors },
  } = useForm<RegisterFormData>()

  const onSubmit = (data: RegisterFormData) => {
    console.log(data)
  }

  return (
    <div className="bg-white rounded-3xl p-10 shadow-2xl w-full max-w-xl">
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
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            First Name
          </label>

          <input
            type="text"
            {...register('firstName', {
              required: 'First name is required',
            })}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="John"
          />

          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Last Name
          </label>

          <input
            type="text"
            {...register('lastName', {
              required: 'Last name is required',
            })}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Doe"
          />

          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.lastName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Institutional Email
          </label>

          <input
            type="email"
            {...register('email', {
              required: 'Email is required',
            })}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="john.doe@uce.edu.ec"
          />

          {errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Password
          </label>

          <input
            type="password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Minimum 8 characters',
              },
            })}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="********"
          />

          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Confirm Password
          </label>

          <input
            type="password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
            })}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="********"
          />

          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-xl font-semibold transition"
        >
          Create Account
        </button>
      </form>
    </div>
  )
}