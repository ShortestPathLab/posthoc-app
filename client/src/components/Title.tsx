import { AppBar, Toolbar, Typography } from "@material-ui/core";

export function Title() {
  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <Typography variant="h6">Path Search Visualiser</Typography>
      </Toolbar>
    </AppBar>
  );
}
