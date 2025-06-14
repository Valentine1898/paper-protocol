interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  currency: string;
  step?: string;
  disabled?: boolean;
  className?: string;
  paddingLeft?: string;
  min?: string;
  max?: string;
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
  min,
  max,
}: CurrencyInputProps) {
  // Disable scroll wheel on number input
  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  // Handle input change with validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Allow empty string for clearing the input
    if (newValue === '') {
      onChange('');
      return;
    }
    
    // Always allow single "0" or numbers ending with "."
    if (newValue === '0' || newValue.endsWith('.')) {
      onChange(newValue);
      return;
    }
    
    // Allow "0.0", "0.00" etc while typing
    if (/^0\.0+$/.test(newValue)) {
      onChange(newValue);
      return;
    }
    
    // Parse the value
    const numValue = parseFloat(newValue);
    
    // Check if it's a valid number
    if (isNaN(numValue)) {
      return;
    }
    
    // Apply max constraint immediately
    if (max !== undefined && numValue > parseFloat(max)) {
      return;
    }
    
    // Apply min constraint
    if (min !== undefined && numValue < parseFloat(min)) {
      // Block values that are clearly below minimum
      // For example, if min is 0.01, block 0.001, 0.009, etc.
      return;
    }
    
    // Allow the change
    onChange(newValue);
  };

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
        onChange={handleChange}
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        disabled={disabled}
        onWheel={handleWheel}
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

