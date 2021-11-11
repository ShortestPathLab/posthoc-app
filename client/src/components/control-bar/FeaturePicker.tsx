import { Button, Typography as Type } from "@material-ui/core";
import { Select } from "components/generic/Select";
import { Space } from "components/generic/Space";
import { find, map, startCase } from "lodash";
import { FeatureDescriptor } from "protocol/FeatureQuery";
import { ReactNode } from "react";

type Props = {
  label?: string;
  value?: string;
  onChange?: (key: string) => void;
  items?: FeatureDescriptor[];
  icon?: ReactNode;
};

export function FeaturePicker({ label, value, onChange, items, icon }: Props) {
  const selected = find(items, { id: value });
  return (
    <Select
      placeholder={startCase(label)}
      trigger={(props) => (
        <Button {...props} disabled={!items?.length} startIcon={icon}>
          {selected?.name ?? label}
        </Button>
      )}
      items={map(items, ({ id, name, description }) => ({
        value: id,
        label: (
          <>
            <Type>{name}</Type>
            <Space />
            <Type variant="body2" color="textSecondary">
              {description}
            </Type>
          </>
        ),
      }))}
      value={selected?.id}
      onChange={onChange}
    />
  );
}
