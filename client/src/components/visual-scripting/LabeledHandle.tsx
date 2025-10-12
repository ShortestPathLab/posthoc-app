import { Stack, TextField, Tooltip, Typography } from "@mui/material";
import { Handle, HandleProps, Position } from "@xyflow/react";
import { isUndefined } from "lodash-es";

export type LabeledHandleProps = Partial<HandleProps> & {
  value?: string;
  label: string;
  description?: string;
  type: "source" | "target";
};

export function LabeledHandle({
  label,
  value,
  description,
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

      <Tooltip title={description}>
        {!isUndefined(value) ? (
          <TextField
            size="small"
            variant="filled"
            label={label}
            defaultValue={value}
            fullWidth
          />
        ) : (
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", whiteSpace: "nowrap" }}
          >
            {label}
          </Typography>
        )}
      </Tooltip>
    </Stack>
  );
}
