import { CodeOutlined } from "@mui-symbols-material/w400";
import { Box, Typography as Type } from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { LayerPicker } from "components/generic/LayerPicker";
import { Heading, Option } from "components/layer-editor/Option";
import { TracePreview } from "components/layer-editor/TracePreview";
import { inferLayerName } from "layers";
import { MapLayerData } from "layers/map";
import { Controller } from ".";
import { find } from "lodash";
import { withProduce } from "produce";
import { useConnections } from "slices/connections";
import { useFeatures } from "slices/features";
import { Layer, WithLayer, useLayerPicker } from "slices/layers";
import { set } from "utils/set";
import { isMapLayer } from "./isMapLayer";

export const editor = withProduce(({ value, produce }) => {
  const { algorithm } = value?.source ?? {};
  const { key: mapLayerKey } = useLayerPicker(isMapLayer);
  const [{ algorithms }] = useFeatures();
  const [connections] = useConnections();
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
            color="text.secondary"
            sx={{ mb: 1, mt: 1 }}
          >
            Define source and destination nodes by clicking on valid regions on{" "}
            {inferLayerName(l)}
          </Type>
        )}
      </WithLayer>

      <Heading label="Preview" />
      <Box sx={{ height: 240, mx: -2 }}>
        <TracePreview trace={value?.source?.trace?.content} />
      </Box>
    </>
  );
}) satisfies Controller["editor"];
