import { CloudStorageService } from "services/CloudStorageService";
import { createSlice } from "./createSlice";

type CloudStorageServiceSliceType = {instance?: CloudStorageService} 
export const [useCloudStorageService, CloudStorageServiceProvider] = createSlice<CloudStorageServiceSliceType>(
  {},
);