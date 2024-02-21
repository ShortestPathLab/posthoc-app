import { FiberManualRecord as Dot } from "@mui/icons-material";
import { Typography as Type, TypographyProps } from "@mui/material";
import { ComponentProps, ReactNode } from "react";

export function OverlineDot(props: ComponentProps<typeof Dot>) {
  return (
    <Dot
      {...props}
      sx={{
        fontSize: 12,
        transform: "translateY(1.75px) translateX(-2px)",
        ...props.sx,
      }}
    />
  );
}

type Props = {
  children?: ReactNode;
} & TypographyProps;

export function Overline({ children, ...props }: Props) {
  return (
    <Type
      variant="overline"
      sx={{ my: -0.75, display: "block", ...props.sx }}
      {...props}
    >
      {children}
    </Type>
  );
}
