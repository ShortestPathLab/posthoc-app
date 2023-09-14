import { withProduce } from "produce";
import { Option } from "./Option";
import { LayerSource } from "./LayerSource";

export const queryLayerSource: LayerSource<"query", {}> = {
  key: "query",
  inferName: () => "Untitled Query",
  editor: withProduce(({ value, produce }) => {
    return (
      <>
        <Option label="This source type is not implemented" />
      </>
    );
  }),
  renderer: ({ layer }) => {
    return <></>;
  },
  steps: ({ children }) => <>{children?.([])}</>,
};
