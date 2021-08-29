import GraphicsManager from './graphics-manager';
import BreakpointService from './breakpoint';
import HistoryService from './history';
import SearchPathService from './search-path';

export default {
  goToEvent(context, id) {
    if(context.currentId <= id) {
      this.goEventForwards(context, id-context.currentId+1);
    } else {
      this.goEventBackwards(context, context.currentId-id-1);
    }
  },

  goEventBackwards(context, backVal) {
    context.timeTravelling = true;
    let currentId = context.currentId;
    let proposedId = currentId - backVal;
    proposedId = Math.max(proposedId, 1);
    while (context.currentId != proposedId + 1) {
      context.stepBackward();
    }
    context.timeTravelling = false;
    context.stepBackward();
  },

  goEventForwards(context, frontVal) {
    context.timeTravelling = true;
    let currentId = context.currentId;
    let proposedId = currentId + frontVal;
    proposedId = Math.min(proposedId, context.totalSteps);
    while (context.currentId != proposedId - 1) {
      context.stepForward();
    }
    context.timeTravelling = false;
    HistoryService.flush();
    SearchPathService.update();
    GraphicsManager.flushBuffer(context);
    context.stepForward();
  },

  goExpansionBackwards(context, backVal) {
    context.timeTravelling = true;
    let steps = context.steps;
    let val = 0;
    while (val != backVal && context.currentId != 0) {
      context.stepBackward();
      let currentId = context.currentId;
      let currentStep = steps[currentId];
      if (currentStep.isFrontier) {
        val++;
      }
    }
    context.timeTravelling = false;
    context.stepForward(true);
    context.stepBackward();
  },

  goExpansionForwards(context, frontVal) {
    context.timeTravelling = true;
    let steps = context.steps;
    let val = 0;
    while (val != frontVal && context.currentId != context.totalSteps) {
      context.stepForward();
      let currentId = context.currentId;
      let currentStep = steps[currentId];
      if (currentStep.isFrontier) {
        val++;
      }
    }
    context.timeTravelling = false;
    HistoryService.flush();
    SearchPathService.update();
    GraphicsManager.flushBuffer(context);
    context.stepForward(true);
    context.stepBackward();
  },

  goBreakpointBackwards(context, backVal) {
    context.timeTravelling = true;
    let steps = context.steps;
    let val = 0;
    while (val != backVal && context.currentId != 0) {
      context.stepBackward();
      let currentId = context.currentId;
      let currentStep = steps[currentId];
      if (!!BreakpointService.check(currentStep.check)) {
        val++;
      }
    }
    context.timeTravelling = false;
    context.stepForward(true);
    context.stepBackward();
  },

  goBreakpointForwards(context, frontVal) {
    context.timeTravelling = true;
    let steps = context.steps;
    let val = 0;
    while (val != frontVal && context.currentId != context.totalSteps) {
      context.stepForward();
      let currentId = context.currentId;
      let currentStep = steps[currentId];
      if (!!BreakpointService.check(currentStep.node)) {
        val++;
      }
    }
    context.timeTravelling = false;
    HistoryService.flush();
    SearchPathService.update();
    GraphicsManager.flushBuffer(context);
    context.stepForward(true);
    context.stepBackward();
  },

  travel(context, type, direction, val){
    switch(type){
      case("Event"):
        switch(direction){
          case("Forward"):
            this.goEventForwards(context, val);
            break;
          case("Backward"):
            this.goEventBackwards(context, val);
            break;
        }
        break;
      case("Expansion"):
        switch(direction){
          case("Forward"):
            this.goExpansionForwards(context, val);
            break;
          case("Backward"):
            this.goExpansionBackwards(context, val);
            break;
        }
        break;
      case("Breakpoint"):
        switch(direction){
          case("Forward"):
            this.goBreakpointForwards(context, val);
            break;
          case("Backward"):
            this.goBreakpointBackwards(context, val);
            break;
        }
        break;
    }
  },

  jump(context, jumpVal) {
    let currentId = context.currentId;
    if (jumpVal > currentId) {
      let frontVal = jumpVal - currentId + 1;
      this.goForwards(context, frontVal);
    } else {
      let backVal = currentId - jumpVal + 1;
      this.goBackwards(context, backVal);
    }
  }
}
