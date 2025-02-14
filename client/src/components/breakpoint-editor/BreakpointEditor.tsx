import {
  Box,
  Checkbox,
  CircularProgress,
  Divider,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { EditorProps } from "components/Editor";
import { Block } from "components/generic/Block";
import { Scroll } from "components/generic/Scrollbars";
import { DebugLayerData } from "hooks/useBreakPoints";
import { useOptimisticTransaction } from "hooks/useOptimistic";
import { find, isEqual, map } from "lodash";
import { produce } from "produce";
import { cloneElement, ReactElement, ReactNode } from "react";
import { slice } from "slices";
import { Layer } from "slices/layers";
import { assert } from "utils/assert";
import { NonEmptyString } from "utils/Char";
import { idle } from "utils/idle";
import { set } from "utils/set";
import handlersCollection from "./breakpoints";
import { BreakpointFieldProps } from "./breakpoints/Breakpoint";
import pluralize from "pluralize";
import { FiberManualRecord } from "@mui/icons-material";

export const breakpointType = [
  "Breakpoint",
  "Monotonicity",
  "Valid Parent",
  "Label out-of-bounds",
];

export type Breakpoint<
  P extends Record<string, unknown> = Record<string, unknown>
> = {
  key: string;
  type?: keyof typeof handlersCollection;
  active?: boolean;
  properties?: P;
};

function Dot({ label, color }: { label?: ReactNode; color?: string }) {
  return (
    <Tooltip title={label}>
      <FiberManualRecord
        sx={{
          color,
          transform: "scale(0.5) translateY(0.3em)",
          ml: -0.5,
          fontSize: "inherit",
        }}
      />
    </Tooltip>
  );
}

function BreakpointStatusDisplay<L extends Layer<DebugLayerData>>({
  layer,
  breakpoint: key,
}: {
  layer?: string;
  breakpoint?: string;
}) {
  "use no memo";
  const one = slice.layers.one<L>(layer);
  const active = one.use((l) => find(l?.source?.breakpoints, { key })?.active);
  const output = one.use(
    (l) => (layer && key ? l?.source?.breakpointOutput?.[key] : []),
    isEqual
  );
  return active ? (
    output ? (
      "error" in output ? (
        <Tooltip title={output.error}>
          <Box component="span">
            <Dot color="error.main" /> {output.error}
          </Box>
        </Tooltip>
      ) : output.length ? (
        <Box component="span">
          <Dot color="error.main" />{" "}
          {pluralize("violation", output.length, true)}
        </Box>
      ) : (
        <Box component="span">
          <Dot color="success.main" /> Valid
        </Box>
      )
    ) : (
      <CircularProgress size={14} />
    )
  ) : (
    "Disabled"
  );
}

export function BreakpointEditor({
  value,
  onChange,
  layer,
}: EditorProps<Breakpoint> & { layer?: string }) {
  assert(value, "breakpoint is defined");

  const [{ type, active, properties }, setOptimistic, isPending] =
    useOptimisticTransaction(value, (f) =>
      idle(() => onChange?.(produce(value!, f)))
    );

  const handler = handlersCollection[type as keyof typeof handlersCollection];

  return (
    handler && (
      <Scroll x>
        <Block vertical sx={{ py: 2 }}>
          <Stack direction="row" alignItems="center" sx={{ gap: 1 }}>
            <Block
              sx={{
                gap: 1,
                flex: 0,
                minWidth: 180,
              }}
              alignItems="center"
            >
              <Checkbox
                sx={{ ml: -1.5 }}
                checked={active}
                onChange={(_e, v) =>
                  setOptimistic((t) => void set(t, "active", v))
                }
              />
              <Stack
                sx={{
                  overflow: "hidden",
                  opacity: (t) =>
                    active ? 1 : t.palette.action.disabledOpacity,
                }}
              >
                <Tooltip title={`${handler.name}: ${handler.description}`}>
                  <Typography
                    variant="body1"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {handler.name}
                  </Typography>
                </Tooltip>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {active ? (
                    isPending ? (
                      <CircularProgress size={14} />
                    ) : (
                      <BreakpointStatusDisplay
                        layer={layer}
                        breakpoint={value.key}
                      />
                    )
                  ) : (
                    "Disabled"
                  )}
                </Typography>
              </Stack>
            </Block>
            <Divider orientation="vertical" flexItem sx={{ m: 1 }} />
            <Stack direction="row" alignItems="center" sx={{ gap: 1, px: 1 }}>
              {handler.fields.length ? (
                map(
                  handler.fields,
                  ({ key, component }) =>
                    !!component &&
                    cloneElement(
                      component as ReactElement<BreakpointFieldProps<unknown>>,
                      {
                        layer,
                        value: properties?.[key],
                        onChange: (v) =>
                          setOptimistic(
                            (t) =>
                              void set(
                                t,
                                `properties.${key as NonEmptyString}`,
                                v
                              )
                          ),
                        disabled: !active,
                      }
                    )
                )
              ) : (
                <Typography color="text.secondary">No options</Typography>
              )}
            </Stack>
          </Stack>
        </Block>
      </Scroll>
    )
  );
}
