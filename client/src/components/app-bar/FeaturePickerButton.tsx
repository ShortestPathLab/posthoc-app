import { KeyboardArrowDownOutlined } from "@mui-symbols-material/w400";
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
        minWidth: "max-content",
        padding: 1,
        "& .MuiButton-startIcon": { color: (t) => t.palette.primary.main },
        ...props.sx,
      }}
      startIcon={icon}
      endIcon={
        arrow && (
          <KeyboardArrowDownOutlined
            sx={{
              ml: -0.5,
              color: (t) => t.palette.text.secondary,
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
