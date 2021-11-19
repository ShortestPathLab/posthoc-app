import { FeatureDescriptor } from "protocol/FeatureQuery";
import { createSlice } from "./createSlice";

type FeatureDescriptorWithSource = FeatureDescriptor & {
  source: string;
};

export type Features = {
  algorithm: FeatureDescriptorWithSource[];
  maps: (FeatureDescriptorWithSource & { type: string })[];
  mapType: FeatureDescriptorWithSource[];
};

export const [useFeatures, FeaturesProvider] = createSlice<Features>({
  algorithm: [],
  maps: [],
  mapType: [],
});
