import { FiberManualRecordOutlined as Dot } from "@mui-symbols-material/w400";
import { Typography as Type, TypographyProps } from "@mui/material";
import { ComponentProps, ReactNode } from "react";

export function OverlineDot(props: ComponentProps<typeof Dot>) {
  return (
    <Dot
      {...props}
      sx={{
        fontSize: 12,
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
      component="div"
      variant="overline"
      sx={{ my: -0.75, display: "block", ...props.sx }}
      {...props}
    >
      {children}
    </Type>
  );
}
