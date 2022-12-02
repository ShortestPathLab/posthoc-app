import { FeatureDescriptor } from "protocol/FeatureQuery";
import { createSlice } from "./createSlice";

type FeatureDescriptorWithSource = FeatureDescriptor & {
  source: string;
};

export type Features = {
  /**
   * A list of currently supported algorithms.
   */
  algorithms: FeatureDescriptorWithSource[];
  /**
   * A list of currently supported maps.
   */
  maps: (FeatureDescriptorWithSource & { type: string })[];
  formats: FeatureDescriptorWithSource[];
};

export const [useFeatures, FeaturesProvider] = createSlice<Features>({
  algorithms: [],
  maps: [],
  formats: [],
});
