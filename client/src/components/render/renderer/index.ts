import { useInterlang } from "slices/interlang";

export {PixiStage} from "./Pixi/PixiStage";


/**
 * This function will be the views manager which will take in the parsed views and then call the respective renderers. 
 */
export function viewsManager(){

  // get the parsed views by context grabber
  const [interlang] = useInterlang()

  // determine how the views should be placed (dimensions)

  // loop through the views sending them to the respective renderers
  for (const view in interlang){

  }

  // return the results from the respective renderers.

}