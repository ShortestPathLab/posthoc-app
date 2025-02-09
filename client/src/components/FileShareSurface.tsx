import {
  CloseOutlined,
  LinkOutlined,
  OpenInNewOutlined,
} from "@mui-symbols-material/w400";
import { Box, ListItemText, Stack, TextField, Typography } from "@mui/material";
import copy from "clipboard-copy";
import { useSm } from "hooks/useSmallDisplay";
import { round } from "lodash";
import { useEffect, useState } from "react";
import { FileMetadata } from "services/cloud-storage/CloudStorage";
import { useCloudStorageService } from "slices/cloudStorage";
import { usePaper } from "theme";
import { useSnackbar } from "./generic/Snackbar";
import { Button } from "./generic/inputs/Button";
import { Surface } from "./generic/surface";

export const FileShareSurface = ({ file }: { file: FileMetadata }) => {
  const [{ instance: cloudService }] = useCloudStorageService();
  const sm = useSm();
  const paper = usePaper();
  const notify = useSnackbar();
  const [link, setLink] = useState("");

  useEffect(() => {
    let isMounted = true;
    const getLink = async () => {
      try {
        const result = await cloudService?.getFileLink(file.id);
        if (isMounted) {
          if (result) setLink(result);
        }
      } catch {
        if (isMounted) setLink("");
      }
    };
    getLink();
    return () => {
      isMounted = false;
    };
  }, [cloudService, file.id]);

  const handleCopy = async () => {
    try {
      if (link) {
        await copy(link);
        notify("Copied to clipboard");
        return link;
      } else {
        throw new Error("Unable to generate link");
      }
    } catch {
      notify("Unable to generate link");
    }
  };
  const handleShare = async () => {
    try {
      const link = await cloudService?.getFileLink(file.id);
      await navigator.share({
        title: "Posthoc visualisation",
        text: link ?? "",
      });
    } catch {
      notify("Unable to generate link");
    }
  };
  return (
    <Stack sx={{ p: sm ? 2 : 3, gap: 2 }}>
      <Box sx={{ width: 128, height: 128, ...paper(1) }} />
      <ListItemText
        primary={file.name}
        secondary={
          <>
            <Typography variant="body2" color="textSecondary">
              Type: {file.mimeType}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Size: {round(+file.size / 1024 / 1024, 2)} MB
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Modified: {new Date(file.lastModified).toLocaleString()}
            </Typography>
          </>
        }
      />
      <Stack sx={{ gap: 1 }}>
        <Surface
          title="Shareable link"
          trigger={({ open }) => {
            return (
              <Button
                variant="contained"
                startIcon={<LinkOutlined color="primary" />}
                onClick={() => {
                  if (link) {
                    open();
                  }
                }}
              >
                Get shareable link
              </Button>
            );
          }}
        >
          <Stack sx={{ p: sm ? 2 : 3, gap: 1, pb: 6 }} direction="row">
            <TextField
              sx={{ flex: 1 }}
              label="Link"
              variant="filled"
              value={link}
              autoFocus
            />
            <Button variant="outlined" onClick={handleCopy}>
              Copy
            </Button>
          </Stack>
        </Surface>
        <Button
          disabled={!navigator.share}
          variant="text"
          startIcon={<OpenInNewOutlined />}
          onClick={handleShare}
        >
          Share via system
        </Button>
        <Button
          disabled={!navigator.share}
          variant="text"
          startIcon={<CloseOutlined color="error" />}
          onClick={handleShare}
        >
          Delete workspace
        </Button>
      </Stack>
    </Stack>
  );
};
