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
            : "/administrator";

      window.location.assign(rolePath);
    } catch (err) {
      // El error ya está siendo manejado por el hook
    }
  };

  return (
    <Card className="rounded-3xl shadow-2xl w-full max-w-xl p-10">
      <div className="mb-8">
        <h3 className="text-3xl font-bold text-slate-800">Create Account</h3>

        <p className="text-slate-500 mt-2">
          Register to access ATS-UCE recruitment platform
        </p>
      </div>

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
          )}
        </div>

        {/* Email */}
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
