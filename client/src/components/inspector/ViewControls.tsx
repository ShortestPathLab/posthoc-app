import {
  CloseOutlined,
  FullscreenOutlined,
  MoreVertOutlined as MoreIcon,
  OpenInNewOutlined as PopOutIcon,
  ViewAgendaOutlined as SplitIcon,
} from "@mui-symbols-material/w400";
import {
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack as MuiStack,
  Tooltip,
} from "@mui/material";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { isMobile } from "mobile-device-detect";

type ViewControlsProps = {
  splitVerticalDisabled?: boolean;
  splitHorizontalDisabled?: boolean;
  closeDisabled?: boolean;
  popOutDisabled?: boolean;
  onSplitVertical?: () => void;
  onSplitHorizontal?: () => void;
  onClose?: () => void;
  onMaximise?: () => void;
  onPopOut?: () => void;
};

export function ViewControls({
  onSplitHorizontal,
  onClose,
  onSplitVertical,
  closeDisabled,
  splitHorizontalDisabled,
  splitVerticalDisabled,
  onPopOut,
  onMaximise,
  popOutDisabled,
}: ViewControlsProps) {
  return (
    <PopupState variant="popover">
      {(state) => (
        <>
          <MuiStack sx={{ m: 1 }}>
            <Tooltip title="Panel Options">
              <IconButton size="small" {...bindTrigger(state)}>
                <MoreIcon fontSize="small" sx={{ color: "text.secondary" }} />
              </IconButton>
            </Tooltip>
          </MuiStack>
          <Menu
            TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
            {...bindMenu(state)}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "top" }}
          >
            <MenuItem
              onClick={() => {
                onSplitVertical?.();
                state.close();
              }}
              disabled={splitVerticalDisabled}
            >
              <ListItemIcon>
                <SplitIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Split vertical</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                onSplitHorizontal?.();
                state.close();
              }}
              disabled={splitHorizontalDisabled}
            >
              <ListItemIcon>
                <SplitIcon
                  fontSize="small"
                  sx={{ transform: "rotate(90deg)" }}
                />
              </ListItemIcon>
              <ListItemText>Split horizontal</ListItemText>
            </MenuItem>
            <Divider />
            {!popOutDisabled && (
              <Box>
                <MenuItem
                  disabled={closeDisabled || popOutDisabled || isMobile}
                  onClick={() => {
                    onPopOut?.();
                    onClose?.();
                    state.close();
                  }}
                >
                  <ListItemIcon>
                    <PopOutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Move to new window</ListItemText>
                </MenuItem>
                <MenuItem
                  disabled={popOutDisabled || isMobile}
                  onClick={() => {
                    onPopOut?.();
                    state.close();
                  }}
                >
                  <ListItemIcon />
                  <ListItemText>Duplicate to new window</ListItemText>
                </MenuItem>
                <Divider />
              </Box>
            )}
            <MenuItem
              onClick={() => {
                onMaximise?.();
                state.close();
              }}
            >
              <ListItemIcon>
                <FullscreenOutlined />
              </ListItemIcon>
              <ListItemText>Maximise</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                onClose?.();
                state.close();
              }}
              disabled={closeDisabled}
            >
              <ListItemIcon>
                <CloseOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText>Close</ListItemText>
            </MenuItem>
          </Menu>
        </>
      )}
    </PopupState>
  );
}
