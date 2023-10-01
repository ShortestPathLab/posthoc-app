import { ArrowDropDownOutlined } from "@mui/icons-material";
import { Button, Typography as Type } from "@mui/material";
import { find, map, startCase } from "lodash";
import { FeatureDescriptor } from "protocol/FeatureQuery";
import { ReactNode } from "react";
import { Select } from "components/generic/Select";
import { Space } from "components/generic/Space";

type Props = {
  label?: string;
  value?: string;
  onChange?: (key: string) => void;
  items?: FeatureDescriptor[];
  icon?: ReactNode;
  showArrow?: boolean;
  disabled?: boolean;
};

export function FeaturePicker({
  label,
  value,
  onChange,
  items,
  icon,
  showArrow,
  disabled,
}: Props) {
  const selected = find(items, { id: value });
  return (
    <Select
      placeholder={startCase(label)}
      trigger={(props) => (
        <Button
          {...props}
          disabled={!items?.length || disabled}
          startIcon={icon}
          endIcon={showArrow && <ArrowDropDownOutlined sx={{ ml: -0.5 }} />}
        >
          {selected?.name ?? label}
        </Button>
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