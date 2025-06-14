interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  currency: string;
  step?: string;
  disabled?: boolean;
  className?: string;
  paddingLeft?: string;
}

export default function CurrencyInput({
  value,
  onChange,
  placeholder = "0.00",
  currency,
  step = "0.001",
  disabled = false,
  className = "",
  paddingLeft = "pl-16",
}: CurrencyInputProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Currency Label */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
        <span className="text-body font-medium text-primary-900/40 text-xl">
          {currency}
        </span>
      </div>

      {/* Input Field */}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={step}
        disabled={disabled}
        className={`
          w-full 
          ${paddingLeft} pr-4 py-4 
          bg-white 
          border-0 border-b-2 border-primary-900/30
          focus:border-primary-900 focus:outline-none
          hover:border-primary-900
          text-body font-medium text-primary-900
          transition-all duration-200
          appearance-none
          [&::-webkit-outer-spin-button]:appearance-none 
          [&::-webkit-inner-spin-button]:appearance-none 
          [&::-webkit-inner-spin-button]:m-0
          [-moz-appearance:textfield]
          text-xl
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      />
    </div>
  );
}
