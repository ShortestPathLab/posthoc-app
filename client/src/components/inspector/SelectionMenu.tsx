import {
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Typography,
} from "@mui/material";
import { SelectEvent as RendererSelectEvent } from "components/renderer/Renderer";
import { useCache } from "hooks/useCache";
import { SelectionInfoProvider } from "layers/LayerController";
import { getController } from "layers/layerControllers";
import { chain, Dictionary, entries, map, merge } from "lodash";
import { ComponentProps, ReactNode, useMemo } from "react";
import { slice } from "slices";

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
  extras?: ReactNode;
};

type SelectionMenuSection = {
  index?: number;
  primary?: ReactNode;
  items?: Dictionary<SelectionMenuEntry>;
};

export type SelectionMenuContent = Dictionary<SelectionMenuSection>;

export function SelectionMenu({ selection, onClose }: Props) {
  const MenuContent = useSelectionMenu();
  const cache = useCache(selection);

  const { client } = selection ?? {};

  return (
    <Menu
      open={!!selection}
      anchorReference="anchorPosition"
      anchorPosition={{
        top: client?.y ?? 0,
        left: client?.x ?? 0,
      }}
      onClose={onClose}
      keepMounted
    >
      <MenuList dense sx={{ py: 0 }}>
        {
          <MenuContent event={cache}>
            {(menu) => {
              const entries2 = entries(menu);
              return entries2.length ? (
                chain(entries2)
                  .sortBy(([, v]) => v.index)
                  .map(([, { items, primary }], i) => (
                    <>
                      {!!i && <Divider sx={{ my: 1, mx: 2 }} />}
                      {primary && (
                        <ListItem sx={{ py: 0 }}>
                          <Typography
                            component="div"
                            color="text.secondary"
                            variant="overline"
                          >
                            {primary}
                          </Typography>
                        </ListItem>
                      )}
                      {chain(items)
                        .entries()
                        .sortBy(([, v]) => v.index)
                        .map(
                          ([
                            k,
                            { action, icon, primary, secondary, extras },
                          ]) => (
                            <>
                              {!!(action || primary || secondary) &&
                                (action ? (
                                  <MenuItem
                                    key={k}
                                    onClick={() => {
                                      action?.();
                                      onClose?.();
                                    }}
                                  >
                                    {icon && (
                                      <ListItemIcon>{icon}</ListItemIcon>
                                    )}
                                    <ListItemText
                                      primary={primary}
                                      sx={{ mr: 4 }}
                                    />
                                    <Typography
                                      component="div"
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {secondary}
                                    </Typography>
                                  </MenuItem>
                                ) : (
                                  <ListItem key={k}>
                                    {icon && (
                                      <ListItemIcon>{icon}</ListItemIcon>
                                    )}
                                    <ListItemText
                                      primary={primary}
                                      sx={{ mr: 4 }}
                                    />
                                    <Typography
                                      component="div"
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {secondary}
                                    </Typography>
                                  </ListItem>
                                ))}
                              {!!extras && extras}
                            </>
                          )
                        )
                        .value()}
                    </>
                  ))
                  .value()
              ) : (
                <>
                  <ListItem>
                    <Typography component="div">No info to show.</Typography>
                  </ListItem>
                </>
              );
            }}
          </MenuContent>
        }
      </MenuList>
    </Menu>
  );
}

type SelectionInfoProviderProps = ComponentProps<SelectionInfoProvider>;

const identity = ({ children }: SelectionInfoProviderProps) => (
  <>{children?.({})}</>
);

function useSelectionMenu() {
  "use no memo";
  const layers = slice.layers.use((s) =>
    map(s, (l) => ({
      key: l.key,
      type: l.source?.type,
    }))
  );
  return useMemo(
    () =>
      chain(layers)
        .reduce((A, l) => {
          const B = getController(l.type)?.provideSelectionInfo ?? identity;
          // eslint-disable-next-line react/display-name
          return ({ children, event }: SelectionInfoProviderProps) => (
            <B layer={l.key} event={event}>
              {(a) => <A event={event}>{(b) => children?.(merge(a, b))}</A>}
            </B>
          );
        }, identity)
        .value(),
    [layers]
  );
}
