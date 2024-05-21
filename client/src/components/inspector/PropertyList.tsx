import {
  Box,
  Button,
  Divider,
  ListItem,
  ListItemText,
  Typography,
  TypographyVariant,
} from "@mui/material";
import { Flex, FlexProps } from "components/generic/Flex";
import {
  ManagedModal as Dialog,
  ManagedModalProps as DialogProps,
  AppBarTitle as Title,
} from "components/generic/Modal";
import { Property, renderProperty } from "components/generic/Property";
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

export const HEURISTIC_PROPS = ["f", "g"];

const ALL_PROPS = [...OMIT_PROPS, ...GRAPH_PROPS, ...HEURISTIC_PROPS];

const sortEventKeys = (e: PropertyListProps["event"]) =>
  _(e)
    .entries()
    .filter(([, v]) => !isUndefined(v))
    .sortBy(([k]) => indexOf(ALL_PROPS, k) + 1 || Number.MAX_SAFE_INTEGER)
    .value();

type PropertyListProps = {
  event?: Dictionary<any>;
  variant?: TypographyVariant;
  max?: number;
  simple?: boolean;
  primitives?: boolean;
};

export function PropertyDialog({
  event,
  max = 10,
  simple: _simple,
  variant: _variant,
  ...rest
}: PropertyListProps & DialogProps) {
  const sorted = sortEventKeys(event);
  return (
    <Dialog
      {...merge(
        {
          appBar: { children: <Title>Event Properties</Title> },
          trigger: (onClick) => (
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
                onClick(e);
              }}
            >
              {sorted.length - max} more
            </Button>
          ),
        } as DialogProps,
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
            sx={{ px: 3 }}
          >
            {startCase(name)}
          </Typography>
          <Box
            key={name}
            sx={{
              p: 1,
              pt: 0,
              display: "grid",
              gridAutoFlow: "row",
              gridTemplateColumns: "repeat(2, 1fr)",
            }}
          >
            {map(props, ([key, value]) => (
              <ListItem key={`${key}::${value}`} sx={{ py: 0.5 }}>
                <ListItemText secondary={key} primary={renderProperty(value)} />
              </ListItem>
            ))}
          </Box>
        </Fragment>
      ))}
    </Dialog>
  );
}

export function PropertyList(props: PropertyListProps & FlexProps) {
  const {
    event,
    variant = "body2",
    max = 10,
    simple,
    primitives,
    ...rest
  } = props;

  const sorted = sortEventKeys(event);
  return (
    <>
      <Flex {...rest}>
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
        {sorted.length > max && !simple && <PropertyDialog {...props} />}
      </Flex>
    </>
  );
}

function isPrimitive(v: any): boolean {
  return isString(v) || isNumber(v);
}
