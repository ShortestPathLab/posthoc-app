import { KeyboardArrowDownOutlined } from "@mui/icons-material";
import { Box, Button, ButtonProps } from "@mui/material";
import { Props } from "./FeaturePicker";

export function FeaturePickerButton({
  children,
  icon,
  arrow,
  ...props
}: ButtonProps & Pick<Props, "icon" | "arrow">) {
  return (
    <Button
      {...props}
      sx={{
        minWidth: 0,
        ...props.sx,
      }}
      startIcon={icon}
      endIcon={
        arrow && (
          <KeyboardArrowDownOutlined
            sx={{
              ml: -0.5,
              color: "text.primary",
              opacity: (t) =>
                props.disabled ? t.palette.action.disabledOpacity : 1,
            }}
          />
        )
      }
    >
      <Box
        sx={{
          color: "text.primary",
          opacity: (t) =>
            props.disabled ? t.palette.action.disabledOpacity : 1,
        }}
      >
        {children}
      </Box>
    </Button>
  );
}
