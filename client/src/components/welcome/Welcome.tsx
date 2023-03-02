import { Typography, Box, Card, CardActionArea, CardContent } from "@material-ui/core";
import { Flex } from "components/generic/Flex";
import { useLoadFile } from "hooks/useLoadFile";
import { useCallback } from "react";
import axios from 'axios';
import { useSpecimen } from "slices/specimen";
import { usePlaybackState } from "hooks/usePlaybackState";
import { useSnackbar } from "components/generic/Snackbar";
import { parseGridMap } from "components/render/renderer/generic/MapParser";
import { parseViews } from "components/render/parser/Parser";

const traceMaps = {
  "grid-astar": {
    title: "Grid Search Astar Algroithm",
    trace: "grid-astar.trace.json",
    map: "Small Maze.grid",
  },
  "tile-generate-xyz": {
    trace: "tile.generatedxys.trace.json",
  },
};

export function Welcome() {

  const [specimen,setSpecimen] = useSpecimen();
  const notify = useSnackbar();
  const {
    stop,
  } = usePlaybackState();

  const loadDemo = useCallback(async () => {
    setSpecimen({...specimen, map: undefined, interlang: undefined, eventList: undefined});
    stop();
    try {
      const traceRes = await axios.get('/traces/grid-astar.trace.json');
      const mapRes = await axios.get('/maps/Small Maze.grid');
      try {
        setSpecimen({
          ...specimen,
          map: parseGridMap(mapRes.data)
        });
        notify(
          `Map load successfully`
        );
      } catch(e) {
        notify(
          `Map load fail`
        );
        throw e;
      }
      try {
        setSpecimen({
          ...specimen,
          interlang: parseViews(traceRes.data.render),
          eventList: traceRes.data.eventList,
        });
        notify(
          `Search Trace load successfully`
        );
      } catch(e) {
        notify(
          `Search Trace load fail`
        );
        throw e;
      }
      
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <>
      <Box sx={{ width: "100%", maxWidth: 500 }} p={3}>
        <Typography variant="h4" gutterBottom>
          Demos
        </Typography>
        <Typography pt={3} variant="h5" gutterBottom>
          Grid
        </Typography>
        <Flex p={2}>
          <Card sx={{maxWidth: 300, backgroundColor: "#1de9b6"}} elevation={8}>
            <CardActionArea onClick={loadDemo}>
              <CardContent>
                <Typography gutterBottom variant="h6">
                  Grid Search
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Flex>
        <Typography pt={3} variant="h5" gutterBottom>
          Tile
        </Typography>
      </Box>
    </>
  );
}
