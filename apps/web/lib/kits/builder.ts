import { randomUUID } from "node:crypto";
import {
  KitSchema,
  KitItemSchema,
  type Kit,
  type KitItem,
  type Preference,
  type ScenarioOutput,
  type Product,
} from "@schemas/index";

const satisfiesDietary = (product: Product, preference: Preference) =>
  preference.dietaryFlags.every((flag) => product.dietaryFlags.includes(flag));

const isBanned = (product: Product, preference: Preference) =>
  preference.bannedBrands.includes(product.brand);

const calcServings = (target: number, perServing: number) => Math.max(1, Math.ceil(target / perServing));

const buildItem = (
  product: Product,
  servings: number,
  flavor: string,
): KitItem =>
  KitItemSchema.parse({
    sku: product.sku,
    name: product.name,
    brand: product.brand,
    flavor,
    quantity: servings,
    unit: product.category === "drink_mix" ? "serving" : "pack",
    carbsG: product.carbsPerServingG * servings,
    sodiumMg: product.sodiumPerServingMg * servings,
    caffeineMg: product.caffeinePerServingMg * servings,
    price: Number((product.pricePerServing * servings).toFixed(2)),
    weightGrams: product.weightPerServingG * servings,
    affiliateUrl: product.affiliateUrl,
  });

const pickProduct = (
  products: Product[],
  preference: Preference,
  strategy: "value" | "premium",
  category: Product["category"],
  fallback?: Product,
): Product | undefined => {
  const eligible = products
    .filter((product) => product.category === category)
    .filter((product) => satisfiesDietary(product, preference))
    .filter((product) => !isBanned(product, preference));

  if (!eligible.length && fallback) return fallback;

  if (strategy === "premium") {
    const prioritized = eligible.filter((product) => preference.favoriteBrands.includes(product.brand));
    if (prioritized.length) {
      return prioritized.sort((a, b) => a.pricePerServing - b.pricePerServing)[0];
    }
  }

  const sorted = eligible.sort((a, b) => a.pricePerServing - b.pricePerServing);
  return sorted[0] ?? fallback;
};

const varianceFlavor = (product: Product, preference: Preference) => {
  if (!product.flavors.length) return product.name;
  const index = preference.targetFlavorDiversity % product.flavors.length;
  return product.flavors[index];
};

const buildVariant = (
  scenario: ScenarioOutput,
  preference: Preference,
  products: Product[],
  variant: "value" | "premium",
  planId: string,
): Kit => {
  const gel = pickProduct(products, preference, variant, "gel");
  const drink = pickProduct(products, preference, variant, "drink_mix");

  if (!gel && !drink) {
    throw new Error("No eligible fueling products for kit build");
  }

  const targetCarbsG = Math.max(scenario.totals.carbs, scenario.fuelPlan.length * 60);
  const gelTarget = targetCarbsG * 0.6;
  const drinkTarget = targetCarbsG * 0.4;

  const items: KitItem[] = [];

  if (gel) {
    const gelFlavor = varianceFlavor(gel, preference) ?? gel.name;
    items.push(buildItem(gel, calcServings(gelTarget, gel.carbsPerServingG), gelFlavor));
  }

  if (drink) {
    const drinkFlavor = varianceFlavor(drink, preference) ?? drink.name;
    items.push(buildItem(drink, calcServings(drinkTarget, drink.carbsPerServingG), drinkFlavor));
  }

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const totalWeight = items.reduce((sum, item) => sum + item.weightGrams, 0);

  return KitSchema.parse({
    id: randomUUID(),
    planId,
    variant,
    items,
    totalPrice: Number(totalPrice.toFixed(2)),
    totalWeightGrams: Number(totalWeight.toFixed(0)),
    updatedAt: new Date().toISOString(),
  });
};

export const buildKitVariants = (
  scenario: ScenarioOutput,
  preference: Preference,
  products: Product[],
  planId?: string,
): Kit[] => {
  const resolvedPlanId = planId ?? scenario.id;
  const valueKit = buildVariant(scenario, preference, products, "value", resolvedPlanId);
  const premiumKit = buildVariant(scenario, preference, products, "premium", resolvedPlanId);
  return [valueKit, premiumKit];
};
