"use client";

import { useRouter } from "next/navigation";

interface StartDepositingButtonProps {
  className?: string;
}

export default function StartDepositingButton({
  className = "",
}: StartDepositingButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push("/deposit");
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-block bg-primary-800 hover:bg-primary-900 text-white font-mono font-bold px-8 py-4 rounded-lg text-2xl transition-colors duration-200 hover:shadow-lg ${className}`}
    >
      Start Depositing
    </button>
  );
}
