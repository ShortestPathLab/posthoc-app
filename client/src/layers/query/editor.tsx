import { CodeOutlined } from "@mui-symbols-material/w400";
import { Typography as Type } from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { LayerPicker } from "components/generic/LayerPicker";
import { Option } from "components/layer-editor/Option";
import { inferLayerName } from "layers";
import { MapLayerData } from "layers/map";
import { find } from "es-toolkit/compat";
import { withProduce } from "produce";
import { slice } from "slices";
import { Layer, WithLayer, useLayerPicker } from "slices/layers";
import { useOne } from "slices/useOne";
import { set } from "utils/set";
import { Controller } from ".";
import { isMapLayer } from "./isMapLayer";

export const editor = withProduce(({ value, produce }) => {
  const { algorithm } = value?.source ?? {};
  const { key: mapLayerKey } = useLayerPicker(isMapLayer);
  const { algorithms } = useOne(slice.features);
  const connections = useOne(slice.connections);
  return (
    <>
      <Option
        label="Algorithm"
        content={
          <FeaturePicker
            arrow
            paper
            icon={<CodeOutlined />}
            label="Algorithm"
            value={algorithm}
            items={algorithms.map((c) => ({
              ...c,
              description: find(connections, { url: c.source })?.name,
            }))}
            onChange={async (v) =>
              produce((p) => void set(p, "source.algorithm", v))
            }
          />
        }
      />
      {!algorithms?.length && (
        <Type
          component="div"
          variant="body2"
          color="warning.main"
          sx={{ mb: 1 }}
        >
          No connected solver has declared support for running algorithms
        </Type>
      )}
      <Option
        label="Map"
        content={
          <LayerPicker<MapLayerData>
            paper
            value={mapLayerKey}
            guard={isMapLayer}
            onChange={(v) => produce((p) => set(p, "source.mapLayerKey", v))}
          />
        }
      />
      <WithLayer<Layer<MapLayerData>> layer={mapLayerKey}>
        {(l) => (
          <Type
            component="div"
            variant="body2"
            color="textSecondary"
            sx={{ mb: 1, mt: 1 }}
          >
            Define source and destination nodes by clicking on valid regions on{" "}
            {inferLayerName(l)}
          </Type>
        )}
      </WithLayer>
    </>
  );
}) satisfies Controller["editor"];
