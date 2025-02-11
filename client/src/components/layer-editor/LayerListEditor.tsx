import { MoreVertOutlined } from "@mui-symbols-material/w400";
import { Box, IconButton, Menu, MenuItem, MenuList } from "@mui/material";
import { ListEditor } from "components/generic/list-editor/ListEditor";
import { each, head, isEqual, map, pick } from "lodash";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { nanoid as id } from "nanoid";
import { useTransition } from "react";
import { slice } from "slices";
import { LayerEditor } from "./LayerEditor";

export function LayerListEditor() {
  "use no memo";
  const layers = slice.layers.use(
    (l) => map(l, (l) => pick(l, "key")),
    isEqual
  );
  const [, startTransition] = useTransition();
  return (
    <Box sx={{ overflow: "auto hidden", width: "100%" }}>
      <Box sx={{ mb: 2 }}>
        <ListEditor
          sortable
          icon={null}
          value={layers}
          deletable
          orderable
          extras={(v) => <LayerListEditorExtras layer={v?.key} />}
          renderEditor={({ extras, handle, value }) => (
            <>
              {handle}
              <LayerEditor layer={value?.key} />
              {extras}
            </>
          )}
          create={() => ({
            source: { type: "trace", trace: {} },
          })}
          onChange={(v) => startTransition(() => slice.layers.set(v))}
          addItemLabels={["Layer"]}
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

function LayerListEditorExtras({ layer }: { layer?: string }) {
  return (
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
                    slice.layers.set(
                      (l) =>
                        void each(
                          l,
                          (s) =>
                            (s.viewKey = s.key === layer ? id() : undefined)
                        )
                    ),
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
  );
}
