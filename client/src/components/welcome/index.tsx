import { Box, Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { Fragment, useCallback } from "react";
import axios from "axios";
import { Flex } from "components/generic/Flex";
import { useSnackbar } from "components/generic/Snackbar";
import { parseViews } from "components/render/parser/Parser";
import { parseGridMap } from "components/render/renderer/generic/MapParser";
import { usePlaybackState } from "hooks/usePlaybackState";
import { useSpecimen } from "slices/specimen";

const traceMaps = {
  grid: {
    "grid-astar": {
      title: "Grid Search Astar",
      trace: "grid-astar.trace.json",
      map: "Small Maze.grid",
      preview: "snip_grid_astar.png",
      color: "#0057b7",
    },
  },
  tile: {
    "tile-generate-xyz": {
      title: "Tile Tree With XYZ",
      trace: "tile.generatedxys.trace.json",
      preview: "snip_tile_tree.png",
      color: "#4caf50",
    },
  },
};

export function Welcome() {
  const [specimen, setSpecimen] = useSpecimen();
  const notify = useSnackbar();
  const { stop } = usePlaybackState();

  const loadDemo = useCallback(async function (demo) {
    stop();
    try {
      const traceRes = await axios.get(`traces/${demo.trace}`, {
        timeout: 2000,
      });
      let mapRes;
      if (demo.map) {
        mapRes = await axios.get(`maps/${demo.map}`, { timeout: 2000 });
      }
      setSpecimen({
        ...specimen,
        interlang: parseViews(traceRes.data.render),
        eventList: traceRes.data.eventList,
        map: mapRes ? parseGridMap(mapRes.data) : undefined,
      });
      notify(`Search Trace load successfully`);
    } catch (err) {
      notify(`Search Trace and Map load fail`);
    }
  }, []);

  return (
    <>
      <Box sx={{ width: "100%", maxWidth: 500 }} p={3}>
        <Typography variant="h4" gutterBottom>
          Demos
        </Typography>
        {Object.entries(traceMaps).map(([section, demos]) => {
          return (
            <Fragment key={section}>
              <Typography variant="h5" pt={2} gutterBottom>
                {section.toUpperCase()}
              </Typography>
              <Flex py={2}>
                {Object.entries(demos).map(([demoName, demo]) => {
                  return (
                    <Fragment key={demoName}>
                      <Card
                        sx={{
                          width: 200,
                          height: 140,
                          color: "#fff",
                          backgroundImage: `url('previews/${demo.preview}')`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          position: "relative",
                          "::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            backgroundColor: demo.color,
                            opacity: 0.8,
                          },
                        }}
                      >
                        <CardActionArea
                          onClick={() => loadDemo(demo)}
                          sx={{ width: "100%", height: "100%" }}
                        >
                          <CardContent>
                            <Typography variant="h6">{demo.title}</Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Fragment>
                  );
                })}
              </Flex>
            </Fragment>
          );
        })}
      </Box>
    </>
  );
}