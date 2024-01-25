import { FeatureDescriptor } from "protocol/FeatureQuery";
import { createSlice } from "./createSlice";

type FeatureDescriptorWithSource = FeatureDescriptor & {
  source: string;
};

export type Features = {
  algorithms: FeatureDescriptorWithSource[];
  maps: (FeatureDescriptorWithSource & { type: string })[];
  formats: FeatureDescriptorWithSource[];
  traces: FeatureDescriptorWithSource[];
};

export const [useFeatures, FeaturesProvider] = createSlice<Features>({
  algorithms: [],
  maps: [],
  formats: [],
  traces: [],
});
