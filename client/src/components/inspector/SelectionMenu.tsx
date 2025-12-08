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
import { entries, map, merge, reduce, sortBy } from "lodash-es";
import { ComponentProps, ReactNode, useMemo } from "react";
import { slice } from "slices";
import { useOne } from "slices/useOne";
import { _ } from "utils/chain";
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
  items?: Record<string, SelectionMenuEntry>;
};

export type SelectionMenuContent = Record<string, SelectionMenuSection>;

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
                _(
                  entries2,
                  (v) => sortBy(v, ([, v]) => v.index),
                  (v) =>
                    map(v, ([, { items, primary }], i) => (
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
                        {_(
                          items,
                          entries,
                          (v) => sortBy(v, ([, v]) => v.index),
                          (v) =>
                            map(
                              v,
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
                              ),
                            ),
                        )}
                      </>
                    )),
                )
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
  const layers = useOne(slice.layers, (s) =>
    map(s, (l) => ({
      key: l.key,
      type: l.source?.type,
    })),
  );
  return useMemo(
    () =>
      reduce(
        layers,
        (A, l) => {
          const B = getController(l.type)?.provideSelectionInfo ?? identity;
          // eslint-disable-next-line react/display-name
          return ({ children, event }: SelectionInfoProviderProps) => (
            <B layer={l.key} event={event}>
              {(a: SelectionMenuContent) => (
                <A event={event}>{(b) => children?.(merge(a, b))}</A>
              )}
            </B>
          );
        },
        identity,
      ),
    [layers],
  );
}
