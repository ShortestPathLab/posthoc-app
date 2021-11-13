import { AppBar, Divider, Toolbar, Typography } from "@material-ui/core";

export function Title() {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ bgcolor: "background.paper", color: "text.primary" }}
    >
      <Toolbar>
        <Typography variant="h6">Path Search Visualiser</Typography>
      </Toolbar>
      <Divider />
    </AppBar>
  );
}
