import { getClient } from "client/getClient";
import { FeatureDescriptor } from "protocol/FeatureQuery";
import { createSlice } from "./createSlice";

type Features = {
  algorithms: FeatureDescriptor[];
  maps: (FeatureDescriptor & { type: string })[];
  mapTypes: FeatureDescriptor[];
};

export const [useFeatures, FeaturesProvider] = createSlice<Features>(
  { algorithms: [], maps: [], mapTypes: [] },
  async () => {
    const client = await getClient();
    return {
      algorithms: (await client.call("features/algorithm")) ?? [],
      maps: (await client.call("features/maps")) ?? [],
      mapTypes: (await client.call("features/mapType")) ?? [],
    };
  }
);
