"use client";

interface PresetButtonProps {
  label: string;
  value: string;
  color: string;
  tier: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function PresetButton({
  label,
  value,
  color,
  tier,
  isSelected,
  onClick,
}: PresetButtonProps) {
  // Clean Tailwind approach
  const getButtonClasses = () => {
    const baseClasses =
      "px-2 py-3 font-semibold flex items-center justify-center hover:scale-105 flex-1 transition-all duration-200 border-3";

    if (color === "gold") {
      return isSelected
        ? `${baseClasses} bg-gold-100 text-gold-800 border-gold-400`
        : `${baseClasses} bg-gold-100 text-gold-800 border-gold-400/0`;
    }

    if (color === "steel") {
      return isSelected
        ? `${baseClasses} bg-steel-100 text-steel-800 border-steel-400`
        : `${baseClasses} bg-steel-100 text-steel-800 border-steel-400/0`;
    }

    if (color === "diamond") {
      return isSelected
        ? `${baseClasses} bg-diamond-100 text-diamond-800 border-diamond-400`
        : `${baseClasses} bg-diamond-100 text-diamond-800 border-diamond-400/0`;
    }

    // Default/paper
    return isSelected
      ? `${baseClasses} bg-paper-100 text-paper-800 border-black`
      : `${baseClasses} bg-paper-100 text-paper-800 border-paper-400/0`;
  };

  return (
    <button
      onClick={onClick}
      className={getButtonClasses()}
      title={`${tier} - Target: $${value}`}
    >
      <span style={{ fontSize: "20px" }}>{label}</span>
    </button>
  );
}
