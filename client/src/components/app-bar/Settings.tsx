import { SettingsTwoTone as SettingsIcon } from "@mui/icons-material";
import { IconButtonWithTooltip } from "components/generic/IconButtonWithTooltip";
import { AppBarTitle as Title, ManagedModal as Dialog } from "components/generic/Modal";
import { SettingsEditor } from "components/settings-editor/SettingsEditor";

export function Settings() {
  return (
    <>
      <Dialog
        trigger={(onClick) => (
          <IconButtonWithTooltip
            {...{ onClick }}
            icon={<SettingsIcon fontSize="small" color="primary" />}
            label="Settings"
          />
        )}
        options={{ width: 960, scrollable: false }}
        appBar={{ children: <Title>Settings</Title> }}
      >
        <SettingsEditor />
      </Dialog>
    </>
  );
}