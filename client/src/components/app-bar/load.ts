import { parseGridMap } from "components/render/renderer/generic/MapParser";
import { parseViews } from "components/render/parser/Parser";
import { Specimen } from "slices/specimen";


export function loadMapFile(f: File, specimen:Specimen, setSpecimen:(next: Specimen) => void, notify:(message?: React.ReactNode) => void) {
  const reader = new FileReader();
  reader.readAsText(f, "UTF-8");
  reader.onload = e => {
    stop();
    try {
      setSpecimen({
        ...specimen,
        map: parseGridMap(e.target?.result as string)
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
}

export function loadTraceFile(f: File, specimen:Specimen, setSpecimen:(next: Specimen) => void, notify:(message?: React.ReactNode) => void) {
  const reader = new FileReader();
    reader.readAsText(f, "UTF-8");
    reader.onload = e => {
      stop();
      try {
        const trace = JSON.parse(e.target?.result as string);
        setSpecimen({
          ...specimen,
          interlang: parseViews(trace.render),
          eventList: trace.eventList,
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
    }
}