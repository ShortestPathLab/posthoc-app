import { KeyboardArrowDownOutlined } from "@mui/icons-material";
import { Box, Button, ButtonProps, useTheme } from "@mui/material";
import { Props } from "./FeaturePicker";

export function FeaturePickerButton({
  children,
  icon,
  showArrow,
  ...props
}: ButtonProps & Pick<Props, "icon" | "showArrow">) {
  const theme = useTheme();
  return (
    <Button
      {...props}
      sx={{
        minWidth: 0,
        ...props.sx,
      }}
      startIcon={icon}
      endIcon={
        showArrow && (
          <KeyboardArrowDownOutlined
            sx={{
              ml: -0.5,
              // For some reason this color must be explicit
              color: theme.palette.text.primary,
              opacity: (t) =>
                props.disabled ? t.palette.action.disabledOpacity : 1,
            }}
          />
        )
      }
    >
      <Box
        sx={{
          color: (t) => t.palette.text.primary,
          opacity: (t) =>
            props.disabled ? t.palette.action.disabledOpacity : 1,
        }}
      >
        {children}
      </Box>
    </Button>
  );
}
