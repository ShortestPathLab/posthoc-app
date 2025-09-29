import { Typography, Box } from "@mui/material";
import { Handle, Position, HandleProps } from "@xyflow/react";

export type LabeledHandleProps = HandleProps & {
  label: string;
};

export function LabeledHandle({
  label,
  type,
  ...handleProps
}: LabeledHandleProps) {
  return (
    <div>
    {type === "target" && (
      <Typography
        variant="caption"
        sx={{ mr: 2.0, color: "text.secondary", whiteSpace: "nowrap" }}
      >
        {label}
      </Typography>
    )}

    <Handle type={type} {...handleProps} />

    {type === "source" && (
      <Typography
        variant="caption"
        sx={{ ml: 2.0, color: "text.secondary", whiteSpace: "nowrap" }}
      >
        {label}
      </Typography>
    )}
  </div>
  );
}
