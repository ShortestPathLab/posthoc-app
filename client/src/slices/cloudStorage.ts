import {
  cloudStorageProviders,
  CloudStorageProvider,
} from "services/cloud-storage";
import { createSlice } from "./createSlice";

type CloudStorageServiceSliceType = {
  instance?: CloudStorageProvider<keyof typeof cloudStorageProviders, unknown>;
};
export const [useCloudStorageService, CloudStorageServiceProvider] =
  createSlice<CloudStorageServiceSliceType>({});
