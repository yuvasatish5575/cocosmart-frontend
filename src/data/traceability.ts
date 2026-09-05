import type { TraceStage } from "./types";

export const journeyStages: TraceStage[] = [
  { key: "farm", label: "Farm", detail: "Sourced from partner coconut farms across Tamil Nadu and Kerala." },
  { key: "harvest", label: "Harvest", detail: "Hand-harvested at peak ripeness by certified climbers, logged on-site." },
  { key: "processing", label: "Processing", detail: "Washed, filtered and processed at the nearest CocoSmart facility within hours." },
  { key: "quality", label: "Quality Check", detail: "Tested against defined purity and safety criteria before batch release." },
  { key: "packaging", label: "Packaging", detail: "Sealed with tamper-evident, batch-coded labelling." },
  { key: "delivery", label: "Delivery", detail: "Dispatched through a monitored cold-chain to your city." },
  { key: "home", label: "Your Home", detail: "Delivered to your door, traceable from farm to doorstep." },
];

export interface Farm {
  id: string;
  name: string;
  location: string;
  farmerName: string;
  partnerSince: number;
  practice: string;
}

export const farms: Farm[] = [
  { id: "f-1", name: "Murugan Coconut Grove", location: "Pollachi, Tamil Nadu", farmerName: "S. Murugan", partnerSince: 2014, practice: "Organic, rainwater-fed" },
  { id: "f-2", name: "Kaithavana Estate", location: "Thrissur, Kerala", farmerName: "Beena Thomas", partnerSince: 2009, practice: "Traditional intercropped" },
  { id: "f-3", name: "Backwater Palms Collective", location: "Alappuzha, Kerala", farmerName: "12-farmer collective", partnerSince: 2017, practice: "Cooperative, fair-trade" },
];
