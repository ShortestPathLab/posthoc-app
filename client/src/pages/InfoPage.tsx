import { ListTwoTone } from "@mui/icons-material";
import { Placeholder } from "components/inspector/Placeholder";
import { Page } from "pages/Page";
import { useViewTreeContext } from "components/inspector/ViewTree";

export function InfoPage() {
  const { controls, onChange, state } = useViewTreeContext();
  return (
    <Page onChange={onChange} stack={state}>
      <Page.Content>
        <Placeholder pt={6} label="Info" icon={<ListTwoTone />} />
      </Page.Content>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
