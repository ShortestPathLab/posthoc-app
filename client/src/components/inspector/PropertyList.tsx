import {
  Box,
  Button,
  Divider,
  ListItem,
  ListItemText,
  Typography,
  TypographyVariant,
} from "@mui/material";
import { Block, BlockProps } from "components/generic/Block";
import { Property, renderProperty } from "components/generic/Property";
import { Surface, SurfaceProps } from "components/generic/surface";
import { useSm } from "hooks/useSmallDisplay";
import {
  Dictionary,
  chain as _,
  constant,
  filter,
  indexOf,
  isNumber,
  isString,
  isUndefined,
  map,
  merge,
  startCase,
} from "lodash";
import { Fragment } from "react";

export const COMMON_PROPS = ["type"];

export const OMIT_PROPS = [...COMMON_PROPS, "id"];

export const ESSENTIAL_PROPS = ["id"];

export const GRAPH_PROPS = [...ESSENTIAL_PROPS, "pId"];

export const HEURISTIC_PROPS = ["f", "g", "h"];

const ALL_PROPS = [...OMIT_PROPS, ...GRAPH_PROPS, ...HEURISTIC_PROPS];

const sortEventKeys = (e: PropertyListProps["event"]) =>
  _(e)
    .entries()
    .filter(([, v]) => !isUndefined(v))
    .sortBy(([k]) => indexOf(ALL_PROPS, k) + 1 || Number.MAX_SAFE_INTEGER)
    .value();

type PropertyListProps = {
  event?: Dictionary<unknown>;
  max?: number;
  simple?: boolean;
  primitives?: boolean;
  variant?: TypographyVariant;
};

export function PropertyDialog({
  event,
  max = 10,
  ...rest
}: Omit<PropertyListProps, "variant" | "simple" | "primitives"> &
  Partial<SurfaceProps>) {
  const sorted = sortEventKeys(event);
  const sm = useSm();
  return (
    <Surface
      {...merge(
        {
          title: "Event Properties",
          trigger: ({ open }) => (
            <Button
              variant="text"
              sx={{
                mx: -1,
                minWidth: 0,
                width: "fit-content",
                color: (t) => t.palette.text.secondary,
                justifyContent: "left",
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                open(e);
              }}
            >
              {sorted.length - max} more
            </Button>
          ),
        } as SurfaceProps,
        rest
      )}
    >
      {[
        {
          name: "common",
          props: filter(sorted, ([k]) => COMMON_PROPS.includes(k)),
        },
        {
          name: "Graph",
          props: filter(sorted, ([k]) => GRAPH_PROPS.includes(k)),
        },
        {
          name: "Heuristic",
          props: filter(sorted, ([k]) => HEURISTIC_PROPS.includes(k)),
        },
        {
          name: "other",
          props: filter(sorted, ([k]) => !ALL_PROPS.includes(k)),
        },
      ].map(({ name, props }, i) => (
        <Fragment key={name}>
          {!!i && <Divider sx={{ mb: 1 }} />}
          <Typography
            component="div"
            variant="overline"
            color="text.secondary"
            sx={{ px: sm ? 2 : 3 }}
          >
            {startCase(name)}
          </Typography>
          <Box
            key={name}
            sx={{
              py: 1,
              pt: 0,
              display: "grid",
              gridAutoFlow: "row",
              gridTemplateColumns: "repeat(2, 1fr)",
            }}
          >
            {map(props, ([key, value]) => (
              <ListItem
                key={`${key}::${value}`}
                sx={{ py: 0.5, px: sm ? -2 : 3 }}
              >
                <ListItemText secondary={key} primary={renderProperty(value)} />
              </ListItem>
            ))}
          </Box>
        </Fragment>
      ))}
    </Surface>
  );
}

export function PropertyList({
  event,
  variant = "body2",
  max = 10,
  simple,
  primitives,
  ...rest
}: PropertyListProps & BlockProps) {
  const sorted = sortEventKeys(event);
  return (
    <Block {...rest}>
      {_(sorted)
        .filter(primitives ? ([, v]) => isPrimitive(v) : constant(true))
        .slice(0, max)
        .map(([k, v], i) => (
          <Property
            label={k}
            value={v}
            key={i}
            type={{ variant }}
            simple={simple}
          />
        ))
        .value()}
      {sorted.length > max && !simple && (
        <PropertyDialog event={event} max={max} />
      )}
    </Block>
  );
}

function isPrimitive(v: unknown): boolean {
  return isString(v) || isNumber(v);
}
