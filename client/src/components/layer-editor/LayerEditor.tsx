import { EditTwoTone } from "@mui/icons-material";
import {
  Avatar,
  Box,
  IconButton,
  Stack,
  TextField,
  Typography as Type,
} from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { MapPicker } from "components/app-bar/Input";
import { Flex } from "components/generic/Flex";
import {
  ManagedModal as Dialog,
  AppBarTitle as Title,
} from "components/generic/Modal";
import { Space } from "components/generic/Space";
import { set, slice, startCase } from "lodash";
import { produce } from "produce";
import { ReactNode } from "react";
import { Layer } from "slices/UIState";

type LayerEditorProps = {
  value: Layer;
  onValueChange?: (v: Layer) => void;
};

export function LayerEditor({
  value,
  onValueChange: onChange,
}: LayerEditorProps) {
  const renderHeading = (label: ReactNode) => (
    <Type variant="overline" color="textSecondary" sx={{pt:1}} component="p">
      {label}
    </Type>
  );
  const renderLabel = (label: ReactNode) => (
    <Type variant="body1">{label}</Type>
  );
  const renderOption = (label: ReactNode, option: ReactNode) => (
    <Flex alignItems="center">
      {renderLabel(label)}
      <Space flex={1} />
      {option}
    </Flex>
  );

  const options = (a: string[]) =>
    a.map((c) => ({
      id: c,
      name: startCase(c),
    }));

  const name = value.name || "Untitled Layer";

  return (
    <>
      <Stack alignItems="center" direction="row" gap={2}>
        <Avatar sx={{ borderRadius: (t) => t.spacing(2) }}>
          {slice(name, 0, 2)}
        </Avatar>
        <Box py={1}>
          <Type>{name}</Type>
          <Type variant="body2" color="text.secondary">
            {startCase(value.source?.type)}
          </Type>
        </Box>
        <Space flex={1} />
        <Stack alignItems="center" direction="row">
          <Dialog
            appBar={{ children: <Title>Edit Layer</Title> }}
            trigger={(onClick) => (
              <IconButton size="small" onClick={onClick}>
                <EditTwoTone />
              </IconButton>
            )}
          >
            <Box p={2}>
              <Box pb={2}>
                <TextField
                  fullWidth
                  variant="filled"
                  label="Layer Name"
                  value={value.name ?? ""}
                  onChange={(e) =>
                    onChange?.(
                      produce(value, (d) => set(d, "name", e.target.value))
                    )
                  }
                />
              </Box>

              {renderHeading("Layer Options")}
              {renderOption(
                "Transparency",
                <FeaturePicker
                  label="Transparency"
                  items={options(["100%"])}
                  showArrow
                />
              )}
              {renderOption(
                "Display Mode",
                <FeaturePicker
                  label="Display Mode"
                  value="normal"
                  items={options(["normal", "difference"])}
                  showArrow
                />
              )}
              {renderHeading("Source Options")}
              {renderOption(
                "Type",
                <FeaturePicker
                  label="Type"
                  value={value.source?.type}
                  items={["map", "trace", "query"].map((s) => ({
                    id: s,
                    name: startCase(s),
                  }))}
                  onChange={(v) =>
                    onChange?.(produce(value, (d) => set(d, "source.type", v)))
                  }
                  showArrow
                />
              )}
              {value.source?.type &&
                {
                  map: <>{renderOption("Source", <MapPicker />)}</>,
                  trace: (
                    <Box color="text.secondary">
                      {renderLabel("This source type is not implemented.")}
                    </Box>
                  ),
                  query: (
                    <Box color="text.secondary">
                      {renderLabel("This source type is not implemented.")}
                    </Box>
                  ),
                }[value.source.type]}
            </Box>
          </Dialog>
        </Stack>
      </Stack>
    </>
  );
}
