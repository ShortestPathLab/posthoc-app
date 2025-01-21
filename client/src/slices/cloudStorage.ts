import { CloudStorageService, providers } from "services/CloudStorageService";
import { createSlice } from "./createSlice";

type CloudStorageServiceSliceType = {
  instance?: CloudStorageService<keyof typeof providers>;
};
export const [useCloudStorageService, CloudStorageServiceProvider] =
  createSlice<CloudStorageServiceSliceType>({});
