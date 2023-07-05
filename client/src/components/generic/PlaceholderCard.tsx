import { Card, CardProps, Typography } from "@mui/material";

export function PlaceholderCard({ sx, children, ...props }: CardProps) {
  return (
    <Card
      sx={{
        m: 2,
        p: 2,
        textAlign: "center",
        ...sx,
      }}
      {...props}
    >
      <Typography color="textSecondary">{children}</Typography>
    </Card>
  );
}
