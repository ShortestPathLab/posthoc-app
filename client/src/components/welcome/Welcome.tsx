import { Typography, Box, Card, CardActionArea, CardContent, CardMedia } from "@material-ui/core";
import { Flex } from "components/generic/Flex";
import { Fragment, useCallback } from "react";
import axios from 'axios';
import { useSpecimen } from "slices/specimen";
import { usePlaybackState } from "hooks/usePlaybackState";
import { useSnackbar } from "components/generic/Snackbar";
import { parseGridMap } from "components/render/renderer/generic/MapParser";
import { parseViews } from "components/render/parser/Parser";

const traceMaps = {
  "grid": {
    "grid-astar": {
      title: "Grid Search Astar",
      trace: "grid-astar.trace.json",
      map: "Small Maze.grid",
      preview: "snip_grid_astar.png",
      color: "#3d5afe",
    },
  },
  "tile": {
    "tile-generate-xyz": {
      title: "Tile Tree With XYZ",
      trace: "tile.generatedxys.trace.json",
      preview: "snip_tile_tree.png",
      color: "#ffab00"
    },
  }
};

export function Welcome() {

  const [specimen,setSpecimen] = useSpecimen();
  const notify = useSnackbar();
  const {
    stop,
  } = usePlaybackState();

  const loadDemo = useCallback(async function (demo) {
    stop();
    setSpecimen({...specimen, map: undefined, interlang: undefined, eventList: undefined});
    try {
      const traceRes = await axios.get(`/traces/${demo.trace}`);
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
      if (demo.map) {
        const mapRes = await axios.get(`/maps/${demo.map}`);
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
        {
          Object.entries(traceMaps).map(([section, demos]) => {
            return (
              <Fragment key={section}>
                <Typography variant="h5" pt={2} gutterBottom>
                  {section.toUpperCase()}
                </Typography>
                <Flex py={2}>
                {
                  Object.entries(demos).map(([demoName, demo]) => {
                    return (
                      <Fragment key={demoName}>
                        <Card sx={{maxWidth: 300, backgroundColor: demo.color, color:"#fff"}}>
                          <CardActionArea onClick={() => loadDemo(demo)}>
                            <CardContent>
                              <Typography variant="h6">
                                {demo.title}
                              </Typography>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Fragment>
                    )
                  })
                }
                </Flex>
              </Fragment>
            )
          })
        }
      </Box>
    </>
  );
}
