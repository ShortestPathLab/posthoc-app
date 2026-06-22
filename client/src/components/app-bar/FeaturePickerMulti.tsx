import { Typography as Type } from "@mui/material";
import { SelectMulti } from "components/generic/inputs/SelectMulti";
import { Space } from "components/generic/Space";
import { filter, head, map, startCase, truncate } from "es-toolkit/compat";
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
  ellipsis: ellipsisProp,
}: Props) {
  // Default moved out of the destructure: object-destructuring defaults make
  // the React Compiler bail out of optimizing this component.
  const ellipsis = ellipsisProp ?? Infinity;
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
        <FeaturePickerButton {...props} disabled={!items?.length} icon={icon} arrow={showArrow}>
          {truncate(buttonLabel, { length: ellipsis })}
        </FeaturePickerButton>
      )}
      items={map(items, ({ id, name, description, hidden }) => ({
        value: id,
        label: (
          <>
            <Type component="div">{name}</Type>
            <Space />
            <Type component="div" variant="body2" color="textSecondary">
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
