import { LayersOutlined } from "@mui-symbols-material/w400";
import {
  FeaturePicker,
  FeaturePickerProps,
} from "components/app-bar/FeaturePicker";
import { EditorProps } from "components/Editor";
import { inferLayerName } from "layers/inferLayerName";
import { Layer, LayerGuard, useLayers } from "slices/layers";
import { QueryLayerData } from "../../layers/query";

import { ReactNode } from "react";
import { slice } from "slices";

function WithLayer<T extends Record<string, unknown>>({
  children,
  layer: key,
}: {
  layer?: string;
  children?: (layer: Layer<T>) => ReactNode;
}) {
  const l = slice.layers.one<Layer<T>>(key).use();
  return l && children?.(l);
}

export function LayerPicker<T extends Record<string, unknown>>({
  guard,
  onChange,
  value,
  ...props
}: EditorProps<string> & { guard?: LayerGuard<T> } & FeaturePickerProps) {
  const { all, guarded } = useLayers<QueryLayerData>(guard);
  return (
    <FeaturePicker
      arrow
      icon={<LayersOutlined />}
      label="Layer"
      {...props}
      value={value}
      items={all.map((c) => ({
        id: c,
        hidden: !guarded.includes(c),
      }))}
      renderItem={(c) => (
        <WithLayer layer={c.id}>{(l) => inferLayerName(l)}</WithLayer>
      )}
      onChange={onChange}
    />
  );
}
