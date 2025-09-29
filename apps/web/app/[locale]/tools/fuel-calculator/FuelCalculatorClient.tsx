"use client";

import dynamic from "next/dynamic";

const FuelCalculator = dynamic(() => import("@/components/tools/FuelCalculator"), { ssr: false });

export default function FuelCalculatorClient() {
  return <FuelCalculator />;
}
