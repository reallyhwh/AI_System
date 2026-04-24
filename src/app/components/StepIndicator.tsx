import { Check } from "lucide-react";

interface Step {
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center px-8 py-4 bg-white border-b border-gray-200">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        return (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 ${
                  isCompleted
                    ? "bg-[#8B1450] border-[#8B1450] text-white"
                    : isCurrent
                    ? "bg-[#8B1450] border-[#8B1450] text-white"
                    : "bg-gray-100 border-gray-300 text-gray-500"
                }`}
              >
                {isCompleted ? <Check size={14} /> : index + 1}
              </div>
              <span
                className={`text-xs mt-1 whitespace-nowrap ${
                  isCompleted || isCurrent ? "text-[#8B1450]" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-4 ${
                  isCompleted ? "bg-[#8B1450]" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
