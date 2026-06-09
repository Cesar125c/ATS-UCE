<<<<<<< HEAD
import { useForm } from "react-hook-form";
import { Input, Button, Card } from "../ui";
import { useSignUpWithRole } from "../../hooks/useSignUpWithRole";

type RegisterFormData = {
  firstName: string;
  lastName: string;
  email: string;
  role: "applicant" | "human_resources" | "authorities";
  password: string;
  confirmPassword: string;
};

export default function RegisterForm() {
  const { signUpUser, error, isLoading } = useSignUpWithRole();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>();

  const selectedRole = watch("role");
  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await signUpUser({
        email: data.email,
        password: data.password,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      const rolePath =
        data.role === "applicant"
          ? "/applicant"
          : data.role === "human_resources"
            ? "/human-resources"
            : "/authorities";

      window.location.assign(rolePath);
    } catch (err) {
      // El error ya está siendo manejado por el hook
    }
  };

  return (
    <Card className="rounded-3xl shadow-2xl w-full max-w-xl p-10">
      <div className="mb-8">
        <h3 className="text-3xl font-bold text-slate-800">Create Account</h3>
=======
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
>>>>>>> 26642c6e8ba0b7939a0cdf07e40ff879e1be1b5b

        <p className="text-slate-500 mt-2">
          Register to access ATS-UCE recruitment platform
        </p>
      </div>

<<<<<<< HEAD
      {error && (
        <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* First Name */}
        <Input
          type="text"
          label="First Name"
          placeholder="John"
          error={errors.firstName?.message}
          {...register("firstName", {
            required: "First name is required",
          })}
        />

        {/* Last Name */}
        <Input
          type="text"
          label="Last Name"
          placeholder="Doe"
          error={errors.lastName?.message}
          {...register("lastName", {
            required: "Last name is required",
          })}
        />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Role
          </label>

          <select
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            {...register("role", {
              required: "Role is required",
            })}
          >
            <option value="">Select a role</option>
            <option value="applicant">Applicant</option>
            <option value="human_resources">Human Resources</option>
            <option value="authorities">Authorities</option>
          </select>

          {errors.role && (
            <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>
=======
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
>>>>>>> 26642c6e8ba0b7939a0cdf07e40ff879e1be1b5b
          )}
        </div>

        {/* Email */}
<<<<<<< HEAD
        <Input
          type="email"
          label="Email"
          placeholder="john.doe@uce.edu.ec"
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            validate: (value) => {
              if (
                (selectedRole === "human_resources" ||
                  selectedRole === "authorities") &&
                !value.endsWith("@uce.edu.ec")
              ) {
                return "This role requires an institutional email (@uce.edu.ec)";
              }

              return true;
            },
          })}
        />

        {/* Password */}
        <Input
          type="password"
          label="Password"
          placeholder="********"
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Minimum 8 characters",
            },
          })}
        />

        {/* Confirm Password */}
        <Input
          type="password"
          label="Confirm Password"
          placeholder="********"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => {
              if (value !== password) {
                return "Passwords do not match";
              }
              return true;
            },
          })}
        />

        {/* Submit */}
        <Button
          type="submit"
          variant="secondary"
          size="lg"
          fullWidth
          isLoading={isSubmitting || isLoading}
        >
          Create Account
        </Button>
      </form>
    </Card>
  );
}
=======
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
>>>>>>> 26642c6e8ba0b7939a0cdf07e40ff879e1be1b5b
