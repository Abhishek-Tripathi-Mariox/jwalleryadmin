import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "../../assets/logo.png";
import { useLogoStore } from "../../store/logoStore";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../store/toastStore";
import { authService } from "../../services/authService";

export const VerifyOtpPage: React.FC = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const primaryLogo = useLogoStore((s) => s.byType.primary?.imageUrl);

  const txnId = location.state?.txnId;
  const email = location.state?.email;

  useEffect(() => {
    if (!txnId) {
      navigate("/forgot-password");
    }
  }, [txnId, navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData
        .split("")
        .concat(Array(6 - pastedData.length).fill(""));
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      toast.error("Please enter complete OTP");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.verifyOtp(txnId, otpString);
      if (response.code === 1) {
        toast.success("OTP verified successfully!");
        navigate("/reset-password", { state: { txnId } });
      } else {
        toast.error(response.message || "Invalid OTP");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    try {
      await authService.forgotPassword(email);
      toast.success("OTP resent successfully!");
      setResendTimer(60);
    } catch (error: any) {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#fdf8ec] to-[#f8d7e0] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={primaryLogo || logo} alt="Swarnaz" className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
          <p className="text-gray-600 mt-2">
            Enter the 6-digit code sent to {email}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Verify OTP
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendTimer > 0}
                  className={`font-medium ${
                    resendTimer > 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-[#B8860B] hover:text-[#996515]"
                  }`}
                >
                  Resend {resendTimer > 0 && `(${resendTimer}s)`}
                </button>
              </p>
            </div>

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
