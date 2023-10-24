import { Box } from "@mui/material";
import { ListEditor } from "components/generic/ListEditor";
import { useLayers, Layer } from "slices/layers";
import { LayerEditor } from "./LayerEditor";

export function LayerListEditor() {
  const [{ layers: layers = [] }, setLayers] = useLayers();
  //   const [{ specimen }] = useSpecimen();

  return (
    <Box sx={{ overflow: "auto hidden", width: "100%" }}>
      <Box sx={{ mb: 2 }}>
        <ListEditor<Layer>
          sortable
          icon={null}
          value={layers}
          useDelete
          useReorder
          editor={(v) => <LayerEditor value={v} />}
          create={() => ({
            source: { type: "trace", trace: {} },
          })}
          onChange={(v) => setLayers(() => ({ layers: v }))}
          addItemLabel="Layer"
          placeholderText={
            <Box pt={2}>Click the button below to add a layer.</Box>
          }
        />
      </Box>
    </Box>
  );
}
