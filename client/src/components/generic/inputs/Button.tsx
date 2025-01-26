import { Box, Button as MuiButton, ButtonProps, alpha } from "@mui/material";
import { usePaper } from "theme";

export function Button({ children, sx, ...props }: ButtonProps) {
  const paper = usePaper();
  return (
    <MuiButton
      disableElevation
      variant="outlined"
      color="primary"
      {...props}
      sx={{
        minWidth: 0,
        borderColor: (t) =>
          alpha(t.palette.text.primary, t.palette.action.activatedOpacity),
        ...(props.variant === "text" ? undefined : paper(1)),
        ...sx,
      }}
    >
      <Box
        sx={{
          color: "text.primary",
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </Box>
    </MuiButton>
  );
}
