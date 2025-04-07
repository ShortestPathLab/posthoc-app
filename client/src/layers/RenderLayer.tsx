import { ErrorPlaceholder } from "components/inspector/Placeholder";
import { inferLayerName } from "layers";
import { createElement } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Layer } from "slices/layers";
import { getController } from "./layerControllers";

export function RenderLayer({
  layer,
  index,
  width,
  height,
}: {
  layer?: Layer;
  index?: number;
  width?: number;
  height?: number;
}) {
  return (
    <ErrorBoundary
      resetKeys={[layer?.viewKey]}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorPlaceholder
          sx={{
            width,
            height,
          }}
          label={`An error occurred with ${inferLayerName(layer)}`}
          secondary={
            "message" in error ? error.message : "Couldn't render your data"
          }
          onReset={resetErrorBoundary}
        />
      )}
    >
      {layer &&
        createElement(getController(layer)?.renderer, {
          layer,
          index,
        })}
    </ErrorBoundary>
  );
}
