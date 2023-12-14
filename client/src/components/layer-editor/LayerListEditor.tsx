import { Box, IconButton } from "@mui/material";
import { ListEditor } from "components/generic/ListEditor";
import { useLayers, Layer } from "slices/layers";
import { LayerEditor } from "./LayerEditor";
import { MoreVertOutlined } from "@mui/icons-material";

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
          deletable
          orderable
          extras={(v) => (
            <IconButton>
              <MoreVertOutlined />
            </IconButton>
          )}
          editor={(v) => <LayerEditor value={v} />}
          create={() => ({
            source: { type: "trace", trace: {} },
          })}
          onChange={(v) => setLayers(() => ({ layers: v }))}
          addItemLabel="Layer"
          placeholder={<Box pt={2}>Click the button below to add a layer.</Box>}
        />
      </Box>
    </Box>
  );
}
