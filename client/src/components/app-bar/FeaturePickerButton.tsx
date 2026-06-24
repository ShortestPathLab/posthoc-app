import { KeyboardArrowDownOutlined } from "@mui-symbols-material/w300";
import { Box, Button, ButtonProps } from "@mui/material";
import { FeaturePickerProps } from "./FeaturePicker";

export function FeaturePickerButton({
  children,
  icon,
  arrow,
  ...props
}: ButtonProps & Pick<FeaturePickerProps, "icon" | "arrow">) {
  return (
    <Button
      {...props}
      sx={{
        borderRadius: 1,
        minWidth: "max-content",
        padding: 0.5,
        "& .MuiButton-startIcon": {
          color: (t) => t.palette.primary.main,
          opacity: (t) => (props.disabled ? t.palette.action.disabledOpacity : 1),
        },
        ...props.sx,
      }}
      startIcon={icon}
      endIcon={
        arrow && (
          <KeyboardArrowDownOutlined
            sx={{
              ml: -0.5,
              color: (t) => t.palette.text.secondary,
              opacity: (t) => (props.disabled ? t.palette.action.disabledOpacity : 1),
            }}
          />
        )
      }
    >
      <Box
        sx={{
          color: (t) => t.palette.text.primary,
          opacity: (t) => (props.disabled ? t.palette.action.disabledOpacity : 1),
        }}
      >
        {children}
      </Box>
    </Button>
  );
}
