import { Typography as Type, BoxProps, Box } from "@material-ui/core";

export function Title(props: BoxProps) {
  return (
    <Box bgcolor="primary.main" p={2} {...props}>
      <Type
        variant="body1"
        color="text.secondary"
        sx={{
          color: "primary.contrastText",
          whiteSpace: "nowrap",
          fontWeight: 500,
        }}
      >
        PFAlgoViz
      </Type>
    </Box>
  );
}
