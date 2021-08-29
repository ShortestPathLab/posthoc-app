import TileStateService from './tile-state';
import MultiAgentStateService from './multi-agent-state';

export default {
  init(stateStructure){
    this.layout = stateStructure.layout;
    if(this.layout == "mapf"){
      MultiAgentStateService.init(stateStructure);
    }
    else{
      TileStateService.init(stateStructure);
    }
  },
  process(state_variables){
    if(this.layout == "mapf"){
      MultiAgentStateService.process(state_variables);
    }
    else{
      TileStateService.process(state_variables);
    }
  }
}
