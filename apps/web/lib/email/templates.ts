import type { Kit, Plan } from "@schemas/index";

export const renderRacePackPurchaseEmail = (plan: Plan, kits: Kit[]) => {
  const kitLines = kits
    .map((kit) => `- ${kit.variant.toUpperCase()}: $${kit.totalPrice.toFixed(2)} (${kit.totalWeightGrams} g)`)
    .join("\n");

  return `Hi athlete,\n\nYour race pack plan (${plan.eventId}) is ready. We included your selected variant (${plan.chosenVariant}) and kit summary below.\n\nKits:\n${kitLines}\n\nDownload your PDF inside the dashboard and review the Scenario Studio for backups.\n`;
};

export const renderWeeklyDebriefEmail = (athleteName: string, highlights: string[]) => {
  const bulletPoints = highlights.map((item) => `- ${item}`).join("\n");
  return `Hi ${athleteName},\n\nHere is your weekly fueling debrief:\n${bulletPoints}\n\nOpen the dashboard to review history, update preferences, and prep the next kit.\n`;
};
