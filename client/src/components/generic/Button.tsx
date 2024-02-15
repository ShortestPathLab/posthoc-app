import { Box, Button as MuiButton, ButtonProps, alpha } from "@mui/material";

export function Button({ children, sx, ...props }: ButtonProps) {
  return (
    <MuiButton
      disableElevation
      variant="outlined"
      color="primary"
      {...props}
      sx={{
        borderColor: (t) =>
          alpha(t.palette.text.primary, t.palette.action.activatedOpacity),
        ...sx,
      }}
    >
      <Box sx={{ color: "text.primary" }}>{children}</Box>
    </MuiButton>
  );
}
