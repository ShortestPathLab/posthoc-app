import { Stack, Tooltip, Typography } from "@mui/material";
import { Handle, HandleProps, Position } from "@xyflow/react";

export type LabeledHandleProps = HandleProps & {
  label: string;
  description?: string;
};

export function LabeledHandle({
  label,
  type,
  ...handleProps
}: LabeledHandleProps) {
  return (
    <Stack
      direction={type === "source" ? "row-reverse" : "row"}
      sx={{
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
      }}
    >
      <Handle
        type={type}
        {...handleProps}
        position={type === "source" ? Position.Right : Position.Left}
      />
      <Tooltip title={handleProps.description}>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", whiteSpace: "nowrap" }}
        >
          {label}
        </Typography>
      </Tooltip>
    </Stack>
  );
}
