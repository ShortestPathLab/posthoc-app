import { Checkbox, ListItemIcon, Menu, MenuItem, Tooltip } from "@mui/material";
import { map } from "lodash-es";
import State, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { ReactElement, ReactNode } from "react";

type Key = string | number;

export type SelectProps<T extends Key> = {
  trigger?: (props: ReturnType<typeof bindTrigger>) => ReactElement;
  items?: { value: T; label?: ReactNode; disabled?: boolean }[];
  value?: Record<T, boolean | undefined>;
  onChange?: (value: Record<T, boolean | undefined>) => void;
  placeholder?: string;
  defaultChecked?: boolean;
};

export function SelectMulti<T extends string>({
  trigger,
  items,
  value,
  onChange,
  placeholder = "Select Options",
  defaultChecked,
}: SelectProps<T>) {
  return (
    <State variant="popover">
      {(state) => (
        <>
          <Tooltip title={placeholder}>
            <span>{trigger?.(bindTrigger(state))}</span>
          </Tooltip>
          <Menu
            {...bindMenu(state)}
            anchorOrigin={{
              horizontal: "left",
              vertical: "bottom",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            {map(items, ({ value: v, label, disabled }) => (
              <MenuItem
                disabled={disabled}
                key={v}
                onClick={() => {
                  onChange?.({
                    ...value!,
                    [v]: !(value?.[v] ?? defaultChecked),
                  });
                }}
              >
                <ListItemIcon>
                  <Checkbox
                    sx={{ p: 0 }}
                    checked={!!(value?.[v] ?? defaultChecked)}
                  />
                </ListItemIcon>
                {label}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </State>
  );
}
