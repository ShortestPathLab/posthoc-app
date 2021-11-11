import { AppBar, Divider, Toolbar, Typography } from "@material-ui/core";

export function Title() {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ background: "white", color: "black" }}
    >
      <Toolbar>
        <Typography variant="h6">Path Search Visualiser</Typography>
      </Toolbar>
      <Divider />
    </AppBar>
  );
}
