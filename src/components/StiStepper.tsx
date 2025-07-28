import { CheckCircle2 } from "lucide-react";

export default function StiStepper({
  step,
  steps,
}: {
  step: number;
  steps: string[];
}) {
  return (
    <div className="flex items-center justify-between mb-12">
      {steps.map((label, idx) => (
        <div key={label} className="flex-1 flex flex-col items-center justify-center relative">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg transition-all duration-300
              ${idx < step ? "bg-green-500" : idx === step ? "bg-primary scale-110" : "bg-gray-300"}
            `}
          >
            {idx < step ? <CheckCircle2 className="w-7 h-7" /> : idx + 1}
          </div>
          <span
            className={`mb-2 text-base font-semibold ${idx === step ? "text-primary" : idx < step ? "text-green-600" : "text-gray-400"}`}
          >
            {label}
          </span>
          {idx < steps.length - 1 && (
            <div
              className="absolute top-6 right-0 left-1/2 h-1 w-full bg-gray-200 z-0"
              style={{ zIndex: -1 }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
