import { Box, Button as MuiButton, ButtonProps, alpha } from "@mui/material";
import { usePaper } from "theme";

export function Button({ children, sx, size, ...props }: ButtonProps) {
  const paper = usePaper();
  return (
    <MuiButton
      disableElevation
      variant="outlined"
      color="inherit"
      {...props}
      sx={{
        borderRadius: 1,
        minWidth: 0,
        borderColor: (t) => alpha(t.palette.text.primary, t.palette.action.activatedOpacity),
        ...(props.variant === "text" ? undefined : paper(1)),
        py: size === "small" ? 0.25 : 0.75,
        px: size === "small" ? 1.25 : 1.5,
        ...sx,
      }}
    >
      <Box
        sx={{
          color: (t) => t.palette.text.primary,
          opacity: (t) => (props.disabled ? t.palette.action.disabledOpacity : 1),
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
