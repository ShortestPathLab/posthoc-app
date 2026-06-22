import { store } from "@davstack/store";
import { FeatureDescriptor } from "protocol/FeatureQuery";

type FeatureDescriptorWithSource = FeatureDescriptor & {
  source: string;
};

export type Features = {
  algorithms: FeatureDescriptorWithSource[];
  maps: (FeatureDescriptorWithSource & { type: string })[];
  formats: FeatureDescriptorWithSource[];
  traces: FeatureDescriptorWithSource[];
};

export const features = store<Features>(
  {
    algorithms: [],
    maps: [],
    formats: [],
    traces: [],
  },
  {
    name: "features",
    devtools: { enabled: import.meta.env.DEV },
  },
);
