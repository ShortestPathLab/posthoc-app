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
  filter,
  indexOf,
  isUndefined,
  map,
  merge,
  slice,
  startCase,
} from "lodash";
import { ComponentProps } from "react";

export const OMIT_PROPS = ["type", "id"];

export const ESSENTIAL_PROPS = ["f", "g", "pId"];

const ALL_PROPS = [...OMIT_PROPS, ...ESSENTIAL_PROPS];

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
};

export function PropertyDialog({
  event,
  max = 10,
  simple,
  variant,
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
          props: filter(sorted, ([k]) => OMIT_PROPS.includes(k)),
        },
        {
          name: "search",
          props: filter(sorted, ([k]) => ESSENTIAL_PROPS.includes(k)),
        },
        {
          name: "other",
          props: filter(sorted, ([k]) => !ALL_PROPS.includes(k)),
        },
      ].map(({ name, props }, i) => (
        <>
          {!!i && <Divider sx={{ mb: 1 }} />}
          <Typography
            variant="overline"
            color="text.secondary"
            component="div"
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
        </>
      ))}
    </Dialog>
  );
}

export function PropertyList(props: PropertyListProps & FlexProps) {
  const { event, variant = "body2", max = 10, simple, ...rest } = props;

  const sorted = sortEventKeys(event);
  return (
    <>
      <Flex {...rest}>
        {map(slice(sorted, 0, max), ([k, v], i) => (
          <Property
            label={k}
            value={v}
            key={i}
            type={{ variant }}
            simple={simple}
          />
        ))}
        {sorted.length > max && !simple && <PropertyDialog {...props} />}
      </Flex>
    </>
  );
}
