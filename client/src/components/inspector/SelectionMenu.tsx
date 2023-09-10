import {
  Box,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Typography,
} from "@mui/material";
import { Overline } from "components/generic/Overline";
import { Property } from "components/generic/Property";
import {
  SelectionInfoProvider,
  getLayerHandler,
} from "components/layer-editor/layers/LayerSource";
import { SelectEvent as RendererSelectEvent } from "components/renderer/Renderer";
import { Dictionary, chain, merge } from "lodash";
import { ComponentProps, ReactNode, useMemo } from "react";
import { useUIState } from "slices/UIState";
import { EventLabel } from "./EventLabel";
import { PropertyList } from "./PropertyList";

type Props = {
  selection?: RendererSelectEvent;
  onClose?: () => void;
};

export type SelectionMenuEntry = {
  index?: number;
  action?: () => void;
  primary?: ReactNode;
  secondary?: ReactNode;
  icon?: ReactNode;
};

type SelectionMenuSection = {
  index?: number;
  primary?: ReactNode;
  items?: Dictionary<SelectionMenuEntry>;
};

export type SelectionMenuContent = Dictionary<SelectionMenuSection>;

export function SelectionMenu({ selection, onClose }: Props) {
  const MenuContent = useSelectionContent(selection);

  const { client: global, info } = selection ?? {};
  const { current, entry, node } = info ?? {};

  return (
    <Menu
      open={!!selection}
      anchorReference="anchorPosition"
      anchorPosition={{
        top: global?.y ?? 0,
        left: global?.x ?? 0,
      }}
      onClose={onClose}
    >
      <MenuList dense sx={{ py: 0, my: 0 }}>
        <ListItem sx={{ py: 0, my: 0 }}>
          <ListItemText>
            <Box>
              <Typography color="text.secondary" variant="overline">
                Point
              </Typography>
              <Property label="x" value={info?.point?.x ?? "-"} />
              <Property label="y" value={info?.point?.y ?? "-"} />
            </Box>
            <Divider sx={{ my: 1 }} />
            {/* {!!info?.components?.length && (
              <>
                <Box>
                  <Overline>Elements</Overline>
                  {info.components.map((c, i) => (
                    <Property
                      key={i}
                      label={c.component.$}
                      value={JSON.stringify(c.meta)}
                    />
                  ))}
                </Box>
                <Divider sx={{ my: 1 }} />
              </>
            )}
            {current?.event && (
              <>
                <Box>
                  <EventLabel event={current?.event} />
                  <PropertyList
                    event={current?.event}
                    variant="body1"
                    vertical
                  />
                </Box>
                <Divider sx={{ my: 1 }} />
              </>
            )} */}
          </ListItemText>
        </ListItem>
        {
          <MenuContent>
            {(menu) => {
              console.log(menu);
              return chain(menu)
                .entries()
                .sortBy(([, v]) => v.index)
                .map(([, { items, primary }], i) => (
                  <>
                    {!!i && <Divider />}
                    {primary && (
                      <ListItem>
                        <Typography color="text.secondary" variant="overline">
                          {primary}
                        </Typography>
                      </ListItem>
                    )}
                    {chain(items)
                      .entries()
                      .sortBy(([, v]) => v.index)
                      .map(([, { action, icon, primary, secondary }]) =>
                        action ? (
                          <MenuItem onClick={action}>
                            {icon && <ListItemIcon>{icon}</ListItemIcon>}
                            <ListItemText primary={primary} />
                            <Typography variant="body2" color="text.secondary">
                              {secondary}
                            </Typography>
                          </MenuItem>
                        ) : (
                          <ListItem>
                            {icon && <ListItemIcon>{icon}</ListItemIcon>}
                            <ListItemText primary={primary} />
                            <Typography variant="body2" color="text.secondary">
                              {secondary}
                            </Typography>
                          </ListItem>
                        )
                      )
                      .value()}
                  </>
                ))
                .value();
            }}
          </MenuContent>
        }
      </MenuList>
    </Menu>
  );
}

type SelectionInfoProviderProps<T> = ComponentProps<SelectionInfoProvider<T>>;

const identity = ({ children }: SelectionInfoProviderProps<any>) => (
  <>{children?.({})}</>
);

function useSelectionContent(selection?: RendererSelectEvent | undefined) {
  const [{ layers }] = useUIState();
  return useMemo(
    () =>
      chain(layers)
        .reduce((A, l) => {
          const B = getLayerHandler(l)?.getSelectionInfo ?? identity;
          return ({ children }: SelectionInfoProviderProps<any>) => (
            <B layer={l} event={selection}>
              {(a) => <A>{(b) => children?.(merge(a, b))}</A>}
            </B>
          );
        }, identity)
        .value(),
    [layers, selection]
  );
}
