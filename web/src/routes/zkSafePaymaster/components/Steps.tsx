import React from "react";

export default function Steps({
  steps,
  activeStep,
  nextStep,
}: {
  steps: any;
  activeStep: number;
  nextStep: (step: any) => void;
}) {
  return (
    <div className="flex space-x-4 items-center">
      {steps.map((step: any, index: number) => (
        <button
          key={index}
          onClick={() => nextStep(index)}
          className={`text-md font-medium ${
            index <= activeStep ? "text-indigo-600" : "text-gray-800"
          }`}
        >
          {index <= activeStep ? (
            <span className="text-indigo-600">&#x2713;</span>
          ) : (
            <span className="text-gray-300">&#x25CF;</span>
          )}
          <span className="ml-2">{step.name}</span>
        </button>
      ))}
    </div>
  );
}