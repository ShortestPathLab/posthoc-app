import { ButtonProps, Typography as Type, useTheme } from "@mui/material";
import { Flex } from "components/generic/Flex";
import { Select } from "components/generic/Select";
import { Space } from "components/generic/Space";
import { find, map, startCase } from "lodash";
import { FeatureDescriptor } from "protocol/FeatureQuery";
import { ReactElement, ReactNode, cloneElement } from "react";
import { AccentColor, getShade } from "theme";
import { FeaturePickerButton } from "./FeaturePickerButton";

export type Props = {
  label?: string;
  value?: string;
  onChange?: (key: string) => void;
  items?: (FeatureDescriptor & { icon?: ReactNode; color?: AccentColor })[];
  icon?: ReactNode;
  showArrow?: boolean;
  disabled?: boolean;
  ButtonProps?: ButtonProps;
  itemOrientation?: "vertical" | "horizontal";
};

export function FeaturePicker({
  label,
  value,
  onChange,
  items,
  icon,
  showArrow,
  disabled,
  ButtonProps,
  itemOrientation = "horizontal",
}: Props) {
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
      placeholder={startCase(label)}
      trigger={(props) => (
        <FeaturePickerButton
          {...props}
          {...ButtonProps}
          disabled={!items?.length || disabled}
          icon={selected?.icon ? getIcon(selected.icon, selected.color) : icon}
          showArrow={showArrow}
        >
          {selected?.name ?? label}
        </FeaturePickerButton>
      )}
      items={map(items, ({ id, name, description, hidden, icon, color }) => ({
        value: id,
        label: (
          <Flex vertical={itemOrientation === "vertical"}>
            <Type>
              {name}
              <Space />
            </Type>
            <Type variant="body2" color="text.secondary">
              {description}
            </Type>
          </Flex>
        ),
        icon: getIcon(icon, color),
        disabled: hidden,
      }))}
      value={selected?.id}
      onChange={onChange}
    />
  );
}
