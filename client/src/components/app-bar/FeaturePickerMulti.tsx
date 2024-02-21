import { Typography as Type } from "@mui/material";
import { SelectMulti } from "components/generic/SelectMulti";
import { Space } from "components/generic/Space";
import { filter, head, map, startCase, truncate } from "lodash";
import { FeatureDescriptor } from "protocol/FeatureQuery";
import { ReactNode } from "react";
import { FeaturePickerButton } from "./FeaturePickerButton";

type Props = {
  label?: string;
  value?: Record<string, boolean | undefined>;
  onChange?: (key: Record<string, boolean | undefined>) => void;
  items?: FeatureDescriptor[];
  icon?: ReactNode;
  showArrow?: boolean;
  defaultChecked?: boolean;
  ellipsis?: number;
};

export function FeaturePickerMulti({
  label,
  value,
  onChange,
  items,
  icon,
  showArrow,
  defaultChecked,
  ellipsis = Infinity,
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
        <FeaturePickerButton
          {...props}
          disabled={!items?.length}
          icon={icon}
          showArrow={showArrow}
        >
          {truncate(buttonLabel, { length: ellipsis })}
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
      value={value}
      onChange={onChange}
    />
  );
}
