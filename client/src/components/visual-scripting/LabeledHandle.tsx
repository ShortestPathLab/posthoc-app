import { Typography } from "@mui/material";
import { Handle, Position, HandleProps } from "@xyflow/react";

export type LabeledHandleProps = HandleProps & {
  label: string;
};

export function LabeledHandle({
  label,
  ...handleProps
}: LabeledHandleProps) {
  return (
    <div className="relative flex items-center">
      {handleProps.type === "target" && (
        <Typography variant="caption" sx={{ mr: 0.5, color: "text.secondary" }}>
            {label}
        </Typography>
      )}
      
      <Handle {...handleProps} />

      {handleProps.type === "source" && (
        <Typography variant="caption" sx={{ ml: 0.5, color: "text.secondary" }}>
            {label}
        </Typography>
      )}
    </div>
  );
}
