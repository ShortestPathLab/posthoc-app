import {
  ButtonProps,
  Stack,
  Typography as Type,
  useTheme,
} from "@mui/material";
import { Select } from "components/generic/inputs/Select";
import { Space } from "components/generic/Space";
import { filter, find, map, startCase, truncate } from "lodash";
import { FeatureDescriptor } from "protocol/FeatureQuery";
import { ReactElement, ReactNode, cloneElement } from "react";
import { AccentColor, getShade, usePaper } from "theme";
import { FeaturePickerButton } from "./FeaturePickerButton";

export type Props = {
  showTooltip?: boolean;
  label?: string;
  value?: string;
  onChange?: (key: string) => void;
  items?: (FeatureDescriptor & { icon?: ReactNode; color?: AccentColor })[];
  icon?: ReactNode;
  arrow?: boolean;
  disabled?: boolean;
  ButtonProps?: ButtonProps;
  itemOrientation?: "vertical" | "horizontal";
  ellipsis?: number;
  paper?: boolean;
};

export function FeaturePicker({
  label,
  value,
  onChange,
  items,
  icon,
  arrow,
  disabled,
  ButtonProps,
  showTooltip,
  itemOrientation = "horizontal",
  ellipsis = Infinity,
  paper: _paper,
}: Props) {
  const paper = usePaper();
  const { palette } = useTheme();

  const getIcon = (icon: ReactNode, color?: AccentColor) =>
    icon &&
    cloneElement(icon as ReactElement, {
      sx: {
        color: color ? getShade(color, palette.mode) : "primary.main",
      },
    });

  const selected = find(items, { id: value });
  return (
    <Select
      showTooltip={showTooltip}
      placeholder={startCase(label)}
      trigger={(props) => (
        <FeaturePickerButton
          {...props}
          {...ButtonProps}
          sx={_paper ? { ...paper(1), my: 0.5, px: 1.25, py: 0.5 } : {}}
          disabled={!filter(items, (item) => !item.hidden)?.length || disabled}
          icon={selected?.icon ? getIcon(selected.icon, selected.color) : icon}
          arrow={arrow}
        >
          {truncate(selected?.name ?? label, {
            length: ellipsis,
          })}
        </FeaturePickerButton>
      )}
      items={map(items, ({ id, name, description, hidden, icon, color }) => ({
        value: id,
        label: (
          <Stack
            alignItems={
              itemOrientation === "vertical" ? "flex-start" : "center"
            }
            direction={itemOrientation === "vertical" ? "column" : "row"}
          >
            <Type component="div">
              {name}
              <Space />
            </Type>
            <Type component="div" color="text.secondary">
              {description}
            </Type>
          </Stack>
        ),
        icon: getIcon(icon, color),
        disabled: hidden,
      }))}
      value={selected?.id}
      onChange={onChange}
    />
  );
}
