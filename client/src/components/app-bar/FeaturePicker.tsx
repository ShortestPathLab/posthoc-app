import { ButtonProps, Typography as Type, useTheme } from "@mui/material";
import { Flex } from "components/generic/Flex";
import { Select } from "components/generic/Select";
import { Space } from "components/generic/Space";
import { find, map, startCase, truncate } from "lodash";
import { FeatureDescriptor } from "protocol/FeatureQuery";
import { ReactElement, ReactNode, cloneElement } from "react";
import { AccentColor, getShade } from "theme";
import { FeaturePickerButton } from "./FeaturePickerButton";

export type Props = {
  showTooltip?: boolean;
  label?: string;
  value?: string;
  onChange?: (key: string) => void;
  items?: (FeatureDescriptor & { icon?: ReactNode; color?: AccentColor })[];
  icon?: ReactNode;
  showArrow?: boolean;
  disabled?: boolean;
  ButtonProps?: ButtonProps;
  itemOrientation?: "vertical" | "horizontal";
  ellipsis?: number;
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
  showTooltip,
  itemOrientation = "horizontal",
  ellipsis = Infinity,
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
      showTooltip={showTooltip}
      placeholder={startCase(label)}
      trigger={(props) => (
        <FeaturePickerButton
          {...props}
          {...ButtonProps}
          disabled={!items?.length || disabled}
          icon={selected?.icon ? getIcon(selected.icon, selected.color) : icon}
          showArrow={showArrow}
        >
          {truncate(selected?.name ?? label, { length: ellipsis })}
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
