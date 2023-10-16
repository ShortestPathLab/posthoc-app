import { ArrowDropDownOutlined } from "@mui/icons-material";
import { Button, Typography as Type } from "@mui/material";
import { SelectMulti } from "components/generic/SelectMulti";
import { Space } from "components/generic/Space";
import { filter, head, map, startCase } from "lodash";
import { FeatureDescriptor } from "protocol/FeatureQuery";
import { ReactNode } from "react";

type Props = {
  label?: string;
  value?: Record<string, boolean | undefined>;
  onChange?: (key: Record<string, boolean | undefined>) => void;
  items?: FeatureDescriptor[];
  icon?: ReactNode;
  showArrow?: boolean;
  defaultChecked?: boolean;
};

export function FeaturePickerMulti({
  label,
  value,
  onChange,
  items,
  icon,
  showArrow,
  defaultChecked,
}: Props) {
  const selected = filter(items, ({ id }) => !!(value?.[id] ?? defaultChecked));

  const buttonLabel = selected.length
    ? selected.length === 1
      ? head(selected)?.name
      : `${selected.length} Selected`
    : label;

  return (
    <SelectMulti
      defaultChecked
      placeholder={startCase(label)}
      trigger={(props) => (
        <Button
          {...props}
          disabled={!items?.length}
          startIcon={icon}
          endIcon={showArrow && <ArrowDropDownOutlined sx={{ ml: -0.5 }} />}
        >
          {buttonLabel}
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
      value={value}
      onChange={onChange}
    />
  );
}
