import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft } from "lucide-react";
import logo from "../../assets/logo.png";
import { useLogoStore } from "../../store/logoStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../store/toastStore";
import { authService } from "../../services/authService";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const primaryLogo = useLogoStore((s) => s.byType.primary?.imageUrl);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(data.email);
      if (response.code === 1) {
        toast.success("OTP sent to your email!");
        navigate("/verify-otp", {
          state: { txnId: response.data.txnId, email: data.email },
        });
      } else {
        toast.error(response.message || "Failed to send OTP");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#fdf8ec] to-[#f8d7e0] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={primaryLogo || logo} alt="Swarnaz" className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
          <p className="text-gray-600 mt-2">
            Enter your email and we'll send you an OTP to reset your password
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@swarnaz.com"
              leftIcon={<Mail className="w-5 h-5" />}
              error={errors.email?.message}
              {...register("email")}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Send OTP
            </Button>

            <Link
              to="/login"
              className="flex items-center justify-center text-sm text-gray-600 hover:text-[#B8860B]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};
