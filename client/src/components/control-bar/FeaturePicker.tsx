import { Button, Typography as Type } from "@material-ui/core";
import { Select } from "components/generic/Select";
import { Space } from "components/generic/Space";
import { find, map, startCase } from "lodash";
import { FeatureDescriptor } from "protocol/FeatureQuery";

type Props = {
  label?: string;
  value?: string;
  onChange?: (key: string) => void;
  items?: FeatureDescriptor[];
};

export function FeaturePicker({ label, value, onChange, items }: Props) {
  const selected = find(items, { id: value });
  return (
    <Select
      placeholder={startCase(label)}
      trigger={(props) => (
        <Button {...props} disabled={!items?.length}>
          {selected?.name ?? label}
        </Button>
      )}
      items={map(items, ({ id, name }) => ({
        value: id,
        label: (
          <>
            <Type>{name}</Type>
            <Space />
            <Type variant="body2" color="textSecondary">
              {id}
            </Type>
          </>
        ),
      }))}
      value={selected?.id}
      onChange={onChange}
    />
  );
}
