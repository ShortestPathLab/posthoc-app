import { CancelOutlined, RefreshOutlined } from "@mui-symbols-material/w400";
import { Placeholder } from "components/inspector/Placeholder";
import { createElement } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Layer } from "slices/layers";
import { getController } from "./layerControllers";
import { inferLayerName } from "layers";
import { Button } from "components/generic/inputs/Button";

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
        <Placeholder
          sx={{
            width,
            height,
          }}
          icon={<CancelOutlined />}
          label={`An error occurred with ${inferLayerName(layer)}`}
          secondary={
            "message" in error ? error.message : "Couldn't render your data"
          }
          action={
            <Button
              variant="text"
              onClick={resetErrorBoundary}
              startIcon={<RefreshOutlined />}
            >
              Reload viewport
            </Button>
          }
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
