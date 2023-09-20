import { Typography as Type } from "@mui/material";
import { FiberManualRecord as Dot } from "@mui/icons-material";
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
};

export function Overline({ children }: Props) {
  return (
    <Type variant="overline" sx={{ my: -0.75, display: "block" }}>
      {children}
    </Type>
  );
}
