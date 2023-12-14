import { MoreVertOutlined } from "@mui/icons-material";
import { Box, IconButton, Menu, MenuItem, MenuList } from "@mui/material";
import { ListEditor } from "components/generic/ListEditor";
import { map, noop } from "lodash";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { Layer, useLayers } from "slices/layers";
import { LayerEditor } from "./LayerEditor";
import { nanoid as id } from "nanoid";

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
            <PopupState variant="popover">
              {(state) => (
                <>
                  <Menu {...bindMenu(state)}>
                    <MenuList dense sx={{ p: 0 }}>
                      {[
                        {
                          name: "Fit Layer",
                          key: "fit-layer",
                          action: () =>
                            setLayers(({ layers }) => ({
                              layers: map(layers, (l) => ({
                                ...l,
                                viewKey: l.key === v?.key ? id() : undefined,
                              })),
                            })),
                        },
                      ].map(({ name, key, action }) => (
                        <MenuItem
                          key={key}
                          onClick={() => {
                            action?.();
                            state.close();
                          }}
                        >
                          {name}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                  <IconButton {...bindTrigger(state)}>
                    <MoreVertOutlined />
                  </IconButton>
                </>
              )}
            </PopupState>
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
