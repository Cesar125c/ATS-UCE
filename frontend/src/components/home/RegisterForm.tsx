import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth, useClerk } from "@clerk/react";
import { z } from "zod";
import { Input, Button, Card } from "../ui";
import { useSignUpWithRole } from "../../hooks/useSignUpWithRole";

const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email"),
    role: z.enum(["applicant", "human_resources", "authorities"], {
      required_error: "Role is required",
    }),
    password: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.role === "human_resources" || data.role === "authorities") {
        return data.email.endsWith("@uce.edu.ec");
      }
      return true;
    },
    {
      message: "This role requires an institutional email (@uce.edu.ec)",
      path: ["email"],
    },
  );

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const { signUpUser, error, isLoading } = useSignUpWithRole();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const { isSignedIn, isLoaded } = useAuth();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/" });
  };

  useEffect(() => {
    reset();
  }, [reset]);

  if (isLoaded && isSignedIn) {
    return (
      <Card className="rounded-2xl shadow-2xl w-full max-w-xl p-6 sm:p-8 text-center">
        <h3 className="text-3xl font-bold text-slate-800 mb-4">
          You are already signed in
        </h3>
        <p className="text-slate-500 mb-6">
          Please sign out before creating a new account.
        </p>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={handleSignOut}
        >
          Sign out
        </Button>
      </Card>
    );
  }

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
            : "/authority";

      window.location.assign(rolePath);
    } catch {
      // The error is already being handled by the hook
    }
  };

  return (
    <Card className="rounded-2xl border-white/70 shadow-2xl shadow-slate-950/30 w-full max-w-xl p-5 sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">Applicant access</p>
        <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">Create your account</h3>

        <p className="text-slate-500 mt-2">
          Complete your details to enter the ATS-UCE platform.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
        <Input
          type="text"
          label="First Name"
          placeholder="John"
          error={errors.firstName?.message}
          {...register("firstName")}
        />

        {/* Last Name */}
        <Input
          type="text"
          label="Last Name"
          placeholder="Doe"
          error={errors.lastName?.message}
          {...register("lastName")}
        />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Role
          </label>

          <select
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
            {...register("role")}
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
          {...register("email")}
        />

        {/* Password */}
        <Input
          type="password"
          label="Password"
          placeholder="********"
          error={errors.password?.message}
          {...register("password")}
        />

        {/* Confirm Password */}
        <Input
          type="password"
          label="Confirm Password"
          placeholder="********"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {/* Submit */}
        <Button
          type="submit"
          variant="danger"
          size="lg"
          fullWidth
          isLoading={isSubmitting || isLoading}
        >
          Create account
        </Button>
      </form>
    </Card>
  );
}
