import { DataObjectOutlined } from "@mui-symbols-material/w400";
import {
  Box,
  Divider,
  ListItem,
  ListItemIcon,
  Menu,
  MenuItem,
  MenuList,
  MenuProps,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import "@react-sigma/core/lib/style.css";
import { useStep } from "components/app-bar/Playback";
import { Label } from "components/generic/Label";
import { PropertyDialog } from "components/inspector/PropertyList";
import { getColorHex } from "components/renderer/colors";
import { highlightNodesOptions, useHighlightNodes } from "hooks/useHighlight";
import { usePlaybackControls } from "hooks/usePlaybackState";
import { findLast, map, startCase } from "lodash-es";
import { WithLayer } from "slices/layers";
import { getShade } from "theme";
import { isDefined } from "./TreeGraph";
import { TreeLayer } from "./TreeLayer";
import { useSelection } from "./useSelection";

export function TreeMenu({
  layer: key,
  selected,
  selection,
  ...props
}: {
  layer?: string;
  selected?: ReturnType<typeof useSelection>["selected"];
  selection?: ReturnType<typeof useSelection>["selection"];
} & MenuProps) {
  const theme = useTheme();
  const step = useStep(key) ?? 0;
  const { stepTo } = usePlaybackControls(key);
  const showHighlight = useHighlightNodes(key);

  const MENU_WIDTH = 360;
  const MENU_MAX_HEIGHT = "min(70vh, 520px)";

  const isIdLabel = (k: string) => k.toLowerCase().includes("id");

  const formatValue = (v: unknown) => {
    if (v === null || v === undefined) return "";
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  };

  const Row = ({ k, v }: { k: string; v: unknown }) => (
    <Stack direction="row" spacing={1} sx={{ py: 0.25, overflowX: "hidden" }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ minWidth: 80, flexShrink: 0 }}
      >
        {k}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        }}
      >
        {formatValue(v)}
      </Typography>
    </Stack>
  );

  return (
    <Menu
      keepMounted
      {...props}
      PaperProps={{
        sx: {
          width: MENU_WIDTH,
          maxHeight: MENU_MAX_HEIGHT,
          overflow: "hidden",
        },
        onWheel: stop,
        onMouseDown: stop,
        onClick: stop,
        onTouchMove: stop,
      }}
    >
      <MenuList
        dense
        sx={{
          p: 0,
          maxHeight: MENU_MAX_HEIGHT,
          overflowY: "auto",
          overflowX: "hidden",
          overscrollBehavior: "contain",
        }}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <ListItem sx={{ py: 0 }}>
          <Typography component="div" color="text.secondary" variant="overline">
            Events at {selection?.node}
          </Typography>
        </ListItem>

        {map(selected?.events, (entry, _, es) => {
          const isSelected =
            findLast(es, (c) => c.step <= step)?.step === entry.step;

          return (
            <Stack
              key={entry.step}
              direction="row"
              sx={{ overflowX: "hidden" }}
            >
              <Tooltip title={`Go to step ${entry.step}`} placement="left">
                <MenuItem
                  selected={isSelected}
                  sx={{
                    height: 32,
                    flex: 1,
                    minWidth: 0,
                    borderLeft: `4px solid ${getColorHex(entry.event.type)}`,
                  }}
                  onClick={() => stepTo(entry.step)}
                >
                  <Box sx={{ ml: -0.5, pr: 2, overflow: "hidden" }}>
                    <Label
                      primary={startCase(entry.event.type)}
                      secondary={
                        isDefined(entry.event.pId)
                          ? `Step ${entry.step}, from ${entry.event.pId}`
                          : `Step ${entry.step}`
                      }
                    />
                  </Box>
                </MenuItem>
              </Tooltip>

              <Box sx={{ flex: 0 }}>
                <PropertyDialog
                  event={entry.event}
                  trigger={({ open }) => (
                    <Tooltip title="See all properties" placement="right">
                      <MenuItem
                        selected={isSelected}
                        onClick={(e) => {
                          open();
                          props?.onClose?.(e, "backdropClick");
                        }}
                        sx={{ pr: 0, flexShrink: 0 }}
                      >
                        <ListItemIcon>
                          <DataObjectOutlined />
                        </ListItemIcon>
                      </MenuItem>
                    </Tooltip>
                  )}
                />
              </Box>
            </Stack>
          );
        })}

        {!!selected?.current && (
          <>
            <Divider sx={{ my: 1, mx: 2 }} />

            {(() => {
              const event = selected.current!.event as Record<string, unknown>;
              const type = String(event?.type ?? "");

              // ID props first in order
              const idProps = Object.entries(event).filter(
                ([k]) => k !== "type" && isIdLabel(k),
              );

              const otherProps = Object.entries(event).filter(
                ([k]) => k !== "type" && !isIdLabel(k),
              );

              return (
                <>
                  {/* Type of event */}
                  <ListItem sx={{ py: 0 }}>
                    <Typography
                      component="div"
                      color="text.secondary"
                      variant="overline"
                    >
                      Type of event
                    </Typography>
                  </ListItem>

                  <Box px={2} pb={1}>
                    <Typography variant="body2">{startCase(type)}</Typography>
                  </Box>

                  {!!idProps.length && (
                    <Box px={2} pb={1}>
                      {idProps.map(([k, v]) => (
                        <Row key={k} k={k} v={v} />
                      ))}
                    </Box>
                  )}

                  <ListItem sx={{ py: 0 }}>
                    <Typography
                      component="div"
                      color="text.secondary"
                      variant="overline"
                    >
                      Other properties
                    </Typography>
                  </ListItem>

                  <Box px={2} py={1}>
                    {otherProps.length ? (
                      otherProps.map(([k, v]) => <Row key={k} k={k} v={v} />)
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        None
                      </Typography>
                    )}
                  </Box>
                </>
              );
            })()}
          </>
        )}

        {!!selected?.current && (
          <>
            <ListItem sx={{ py: 0 }}>
              <Typography
                component="div"
                color="text.secondary"
                variant="overline"
              >
                Focus on
              </Typography>
            </ListItem>

            {map(highlightNodesOptions, (highlight) => {
              const highlightColor = getShade(
                highlight.color,
                theme.palette.mode,
                500,
                400,
              );

              return (
                <Stack key={highlight.type} direction="row">
                  <Tooltip title={highlight.description} placement="left">
                    <WithLayer<TreeLayer> layer={key}>
                      {(l) => (
                        <MenuItem
                          selected={
                            l.source?.highlighting?.type === highlight.type &&
                            l.source?.highlighting?.step ===
                              selected?.current?.step
                          }
                          sx={{
                            height: 32,
                            flex: 1,
                            minWidth: 0,
                            borderLeft: `4px solid ${highlightColor}`,
                          }}
                          onClick={(e) => {
                            showHighlight[highlight.type](
                              selected!.current!.step!,
                            );
                            props?.onClose?.(e, "backdropClick");
                          }}
                        >
                          <Box sx={{ ml: -0.5, pr: 2, overflow: "hidden" }}>
                            <Label primary={startCase(highlight.type)} />
                          </Box>
                        </MenuItem>
                      )}
                    </WithLayer>
                  </Tooltip>
                </Stack>
              );
            })}
          </>
        )}
      </MenuList>
    </Menu>
  );
}
