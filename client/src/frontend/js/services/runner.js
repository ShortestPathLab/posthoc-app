import FrontierService from '../services/frontier';
import SearchPathService from '../services/search-path';
import HistoryService from '../services/history';

//history
//clear the canvas
//trace all the nodes till now
//create the frontier nodes as per the array of frontier nodes.

//put rectangles that are extra - this includes. removing the frontier nodes as well - only when closing
//when generating/updating - first opened node and then frontier node

//source, destination, expanding, frontier, opened, closed
//source and destination remain untouched
//expanding is current - its color is coming directly.
//frontier - all generating/updating nodes that come between 2 expanding
//opened - all the nodes that are not closed or expanded
//closed - the one that is closed

//source, destination, expanding, closed, opened are mentioned. Only frontier is tricky


/**
* @function runnerFactory
* This function return the runner function that visualises the current step of the algorithm. It inserts the current node, add or clear frontier nodes if applicable, update the history, update the line and update the id.
* @param {Array} steps - array of steps of the algorithm
* @returns {function} runner - returns the runner function
*/
let runnerFactory = function(steps) {
    let self = this;
    let startTime = new Date();
    let runner = (() => {
        let id = self.currentId;
        if (id > self.totalSteps) {
            let endTime = new Date();
            alert(endTime - startTime);
            return;
        }
        //update history
        HistoryService.update();

        FrontierService.update();

        //update search path
        SearchPathService.update();

        //update id
        HistoryService.updateId();
    });
    return runner;
}
export default runnerFactory;
