import { MoreVertOutlined } from "@mui-symbols-material/w400";
import { Box, IconButton, Menu, MenuItem, MenuList } from "@mui/material";
import { ListEditor } from "components/generic/ListEditor";
import { head, map } from "lodash";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { nanoid as id } from "nanoid";
import { Layer, useLayers } from "slices/layers";
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
          deletable
          orderable
          extras={(v) => (
            <PopupState variant="popover">
              {(state) => (
                <>
                  <Menu
                    {...bindMenu(state)}
                    transformOrigin={{
                      horizontal: "right",
                      vertical: "top",
                    }}
                    anchorOrigin={{
                      horizontal: "right",
                      vertical: "bottom",
                    }}
                  >
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
                  <IconButton
                    {...bindTrigger(state)}
                    sx={{ color: (t) => t.palette.text.secondary }}
                  >
                    <MoreVertOutlined />
                  </IconButton>
                </>
              )}
            </PopupState>
          )}
          renderEditor={({ extras, handle, value, onValueChange }) => (
            <>
              {handle}
              <LayerEditor {...{ value, onValueChange }} />
              {extras}
            </>
          )}
          create={() => ({
            source: { type: "trace", trace: {} },
          })}
          onChange={(v) =>
            requestIdleCallback(() => setLayers(() => ({ layers: v })), {
              timeout: 300,
            })
          }
          addItemLabel="Layer"
          placeholder={<Box pt={2}>Get started by adding a layer.</Box>}
          onFocus={(key) => {
            const element = head(document.getElementsByClassName(key));
            if (
              element &&
              "click" in element &&
              typeof element.click === "function"
            ) {
              element.click();
            }
          }}
        />
      </Box>
    </Box>
  );
}
