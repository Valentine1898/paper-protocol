interface Preset {
  label: string;
  value: string;
}

interface PresetInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  presets: Preset[];
  placeholder?: string;
  step?: string;
  type?: string;
  presetButtonColor?: 'blue' | 'green';
  helperText?: string;
}

export default function PresetInput({
  label,
  value,
  onChange,
  presets,
  placeholder,
  step = "0.0001",
  type = "number",
  presetButtonColor = 'blue',
  helperText
}: PresetInputProps) {
  const getPresetButtonClasses = () => {
    const baseClasses = "px-2 py-1 text-xs rounded hover:transition-colors whitespace-nowrap";
    
    if (presetButtonColor === 'green') {
      return `${baseClasses} bg-green-100 text-green-700 hover:bg-green-200`;
    }
    
    return `${baseClasses} bg-blue-100 text-blue-700 hover:bg-blue-200`;
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="space-y-2">
        <div className="relative">
          <input
            type={type}
            step={step}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-3 pr-40 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => onChange(preset.value)}
                className={getPresetButtonClasses()}
              >
                {preset.value}
              </button>
            ))}
          </div>
        </div>
        {helperText && (
          <p className="text-xs text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    </div>
  );
} 