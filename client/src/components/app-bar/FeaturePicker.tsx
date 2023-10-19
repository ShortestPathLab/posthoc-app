import { ButtonProps, Typography as Type } from "@mui/material";
import { Select } from "components/generic/Select";
import { Space } from "components/generic/Space";
import { find, map, startCase } from "lodash";
import { FeatureDescriptor } from "protocol/FeatureQuery";
import { ReactNode } from "react";
import { FeaturePickerButton } from "./FeaturePickerButton";

export type Props = {
  label?: string;
  value?: string;
  onChange?: (key: string) => void;
  items?: FeatureDescriptor[];
  icon?: ReactNode;
  showArrow?: boolean;
  disabled?: boolean;
  ButtonProps?: ButtonProps;
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
}: Props) {
  const selected = find(items, { id: value });
  return (
    <Select
      placeholder={startCase(label)}
      trigger={(props) => (
        <FeaturePickerButton
          {...props}
          {...ButtonProps}
          disabled={!items?.length || disabled}
          icon={icon}
          showArrow={showArrow}
        >
          {selected?.name ?? label}
        </FeaturePickerButton>
      )}
      items={map(items, ({ id, name, description, hidden }) => ({
        value: id,
        label: (
          <>
            <Type>{name}</Type>
            <Space />
            <Type variant="body2" color="text.secondary">
              {description}
            </Type>
          </>
        ),
        disabled: hidden,
      }))}
      value={selected?.id}
      onChange={onChange}
    />
  );
}
