import { BootstrapService } from "services/BootstrapService";
import { CloudStorageService } from "services/cloud-storage";
import { BootstrapCloudStorageFileService } from "services/cloud-storage/BootstrapCloudStorageFileService";
import { ConnectionsService } from "services/ConnectionsService";
import { FeaturesService } from "services/FeaturesService";
import { LayerService } from "services/LayerService";
import { LogCaptureService } from "services/LogCaptureService";
import { RendererService } from "services/RendererService";
import { SettingsService } from "services/SettingsService";
import { SyncService } from "services/SyncService";

export const services = [
  SyncService,
  ConnectionsService,
  FeaturesService,
  RendererService,
  LayerService,
  LogCaptureService,
  SettingsService,
  BootstrapService,
  CloudStorageService,
  BootstrapCloudStorageFileService,
];
