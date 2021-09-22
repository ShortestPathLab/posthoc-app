import { getClient } from "client/getClient";
import { FeatureDescriptor } from "protocol/FeatureQuery";
import { createSlice } from "./createSlice";

type Features = {
  algorithms: FeatureDescriptor[];
  maps: (FeatureDescriptor & { type: string })[];
};

export const [useFeatures, FeaturesProvider] = createSlice<Features>(
  { algorithms: [], maps: [] },
  async () => {
    const client = await getClient();
    return {
      algorithms: (await client.call("features/algorithm")) ?? [],
      maps: (await client.call("features/maps")) ?? [],
    };
  }
);
