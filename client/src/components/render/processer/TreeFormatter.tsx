
// @ts-nocheck
import * as d3 from 'd3-hierarchy';
import { TraceEvent } from 'protocol/Trace';

export function processTree(eventList:TraceEvent[]){

  let obj :{[key:string|number]:{id:string|number, parentId:string|number|undefined|null}}  = {};
  eventList.forEach((event) => {
    if(obj[event.id]){
      obj[event.id].id = event.id;
      obj[event.id].parentId = event.pId;
    }
    else{
      obj[event.id] = { id: event.id, parentId: event.pId};
    }
  });


  let table = Object.values(obj);

  let root = d3.stratify()(table);
  let height = root.height + 1;
  root = d3.tree()
           .nodeSize([100, 100])
           .size([height, height])
           (root);
    root.descendants().forEach(node => {
        // TODO optimize this code, which basically adds the x and y coordinates to the eventList information
        eventList =  eventList.map((event)=> {

            if (event.id === node.data.id){
                console.log
                return {...event, 'x':node.x, 'y':node.y}
            }
            else{

                return event
            }
        })
    });

  return eventList
}


const tileEvents :TraceEvent[] = [
  {
      "11": 1,
      "12": 4,
      "13": 7,
      "21": 2,
      "22": 5,
      "23": 8,
      "31": 3,
      "32": 6,
      "33": 0,
      "id": 1,
      "type": "source"
  },
  {
      "11": 1,
      "12": 4,
      "13": 6,
      "21": 2,
      "22": 5,
      "23": 7,
      "31": 3,
      "32": 0,
      "33": 8,
      "id": 25,
      "type": "destination"
  },
  {
      "11": 1,
      "12": 4,
      "13": 7,
      "21": 2,
      "22": 5,
      "23": 8,
      "31": 3,
      "32": 6,
      "33": 0,
      "id": 1,
      "type": "generating",
      "pId": null,
      "f": 0.165572,
      "g": 0.582127
  },
  {
      "11": 1,
      "12": 4,
      "13": 7,
      "21": 2,
      "22": 5,
      "23": 8,
      "31": 3,
      "32": 6,
      "33": 0,
      "id": 1,
      "type": "expanding",
      "pId": null,
      "f": 0.252174,
      "g": 0.509215
  },
  {
      "11": 1,
      "12": 4,
      "13": 7,
      "21": 2,
      "22": 5,
      "23": 0,
      "31": 3,
      "32": 6,
      "33": 8,
      "id": 2,
      "type": "generating",
      "pId": 1,
      "f": 0.534285,
      "g": 0.617753
  },
  {
      "11": 1,
      "12": 4,
      "13": 7,
      "21": 2,
      "22": 5,
      "23": 8,
      "31": 3,
      "32": 0,
      "33": 6,
      "id": 3,
      "type": "generating",
      "pId": 1,
      "f": 0.322721,
      "g": 0.820226
  },
  {
      "11": 1,
      "12": 4,
      "13": 7,
      "21": 2,
      "22": 5,
      "23": 8,
      "31": 3,
      "32": 6,
      "33": 0,
      "id": 1,
      "type": "closing",
      "pId": null,
      "f": 0.492609,
      "g": 0.0603113
  },
  {
      "11": 1,
      "12": 4,
      "13": 7,
      "21": 2,
      "22": 5,
      "23": 0,
      "31": 3,
      "32": 6,
      "33": 8,
      "id": 2,
      "type": "expanding",
      "pId": 1,
      "f": 0.879944,
      "g": 0.662947
  },
  {
      "11": 1,
      "12": 4,
      "13": 0,
      "21": 2,
      "22": 5,
      "23": 7,
      "31": 3,
      "32": 6,
      "33": 8,
      "id": 4,
      "type": "generating",
      "pId": 2,
      "f": 0.730471,
      "g": 0.75441
  },
  {
      "11": 1,
      "12": 4,
      "13": 7,
      "21": 2,
      "22": 0,
      "23": 5,
      "31": 3,
      "32": 6,
      "33": 8,
      "id": 5,
      "type": "generating",
      "pId": 2,
      "f": 0.334589,
      "g": 0.729135
  },
  {
      "11": 1,
      "12": 4,
      "13": 7,
      "21": 2,
      "22": 5,
      "23": 0,
      "31": 3,
      "32": 6,
      "33": 8,
      "id": 2,
      "type": "closing",
      "pId": 1,
      "f": 0.933508,
      "g": 0.242002
  },
  {
      "11": 1,
      "12": 4,
      "13": 0,
      "21": 2,
      "22": 5,
      "23": 7,
      "31": 3,
      "32": 6,
      "33": 8,
      "id": 4,
      "type": "expanding",
      "pId": 2,
      "f": 0.653578,
      "g": 0.495427
  },
  {
      "11": 1,
      "12": 0,
      "13": 4,
      "21": 2,
      "22": 5,
      "23": 7,
      "31": 3,
      "32": 6,
      "33": 8,
      "id": 6,
      "type": "generating",
      "pId": 4,
      "f": 0.907213,
      "g": 0.293573
  },
  {
      "11": 1,
      "12": 4,
      "13": 0,
      "21": 2,
      "22": 5,
      "23": 7,
      "31": 3,
      "32": 6,
      "33": 8,
      "id": 4,
      "type": "closing",
      "pId": 2,
      "f": 0.68793,
      "g": 0.678225
  },
  {
      "11": 1,
      "12": 0,
      "13": 4,
      "21": 2,
      "22": 5,
      "23": 7,
      "31": 3,
      "32": 6,
      "33": 8,
      "id": 6,
      "type": "expanding",
      "pId": 4,
      "f": 0.53847,
      "g": 0.732847
  },
  {
      "11": 1,
      "12": 5,
      "13": 4,
      "21": 2,
      "22": 0,
      "23": 7,
      "31": 3,
      "32": 6,
      "33": 8,
      "id": 7,
      "type": "generating",
      "pId": 6,
      "f": 0.777499,
      "g": 0.818796
  },
  {
      "11": 0,
      "12": 1,
      "13": 4,
      "21": 2,
      "22": 5,
      "23": 7,
      "31": 3,
      "32": 6,
      "33": 8,
      "id": 8,
      "type": "generating",
      "pId": 6,
      "f": 0.701176,
      "g": 0.00705306
  },
  {
      "11": 1,
      "12": 0,
      "13": 4,
      "21": 2,
      "22": 5,
      "23": 7,
      "31": 3,
      "32": 6,
      "33": 8,
      "id": 6,
      "type": "closing",
      "pId": 4,
      "f": 0.145388,
      "g": 0.374991
  },
  {
      "11": 1,
      "12": 5,
      "13": 4,
      "21": 2,
      "22": 0,
      "23": 7,
      "31": 3,
      "32": 6,
      "33": 8,
      "id": 7,
      "type": "expanding",
      "pId": 6,
      "f": 0.508514,
      "g": 0.589339
  },
  {
      "11": 1,
      "12": 5,
      "13": 4,
      "21": 2,
      "22": 6,
      "23": 7,
      "31": 3,
      "32": 0,
      "33": 8,
      "id": 9,
      "type": "generating",
      "pId": 7,
      "f": 0.674322,
      "g": 0.301884
  },
  {
      "11": 1,
      "12": 5,
      "13": 4,
      "21": 0,
      "22": 2,
      "23": 7,
      "31": 3,
      "32": 6,
      "33": 8,
      "id": 10,
      "type": "generating",
      "pId": 7,
      "f": 0.206905,
      "g": 0.322556
  },
  {
      "11": 1,
      "12": 5,
      "13": 4,
      "21": 2,
      "22": 7,
      "23": 0,
      "31": 3,
      "32": 6,
      "33": 8,
      "id": 11,
      "type": "generating",
      "pId": 7,
      "f": 0.52192,
      "g": 0.557915
  },
  {
      "11": 1,
      "12": 5,
      "13": 4,
      "21": 2,
      "22": 0,
      "23": 7,
      "31": 3,
      "32": 6,
      "33": 8,
      "id": 7,
      "type": "closing",
      "pId": 6,
      "f": 0.454067,
      "g": 0.133271
  },
  {
      "11": 1,
      "12": 5,
      "13": 4,
      "21": 2,
      "22": 6,
      "23": 7,
      "31": 3,
      "32": 0,
      "33": 8,
      "id": 9,
      "type": "expanding",
      "pId": 7,
      "f": 0.883163,
      "g": 0.975181
  },
  {
      "11": 1,
      "12": 5,
      "13": 4,
      "21": 2,
      "22": 6,
      "23": 7,
      "31": 0,
      "32": 3,
      "33": 8,
      "id": 12,
      "type": "generating",
      "pId": 9,
      "f": 0.596134,
      "g": 0.544864
  },
  {
      "11": 1,
      "12": 5,
      "13": 4,
      "21": 2,
      "22": 6,
      "23": 7,
      "31": 3,
      "32": 8,
      "33": 0,
      "id": 13,
      "type": "generating",
      "pId": 9,
      "f": 0.950494,
      "g": 0.330888
  },
  {
      "11": 1,
      "12": 5,
      "13": 4,
      "21": 2,
      "22": 6,
      "23": 7,
      "31": 3,
      "32": 0,
      "33": 8,
      "id": 9,
      "type": "closing",
      "pId": 7,
      "f": 0.415748,
      "g": 0.865509
  },
  {
      "11": 1,
      "12": 5,
      "13": 4,
      "21": 2,
      "22": 6,
      "23": 7,
      "31": 3,
      "32": 8,
      "33": 0,
      "id": 13,
      "type": "expanding",
      "pId": 9,
      "f": 0.0440166,
      "g": 0.690062
  },
  {
      "11": 1,
      "12": 5,
      "13": 4,
      "21": 2,
      "22": 6,
      "23": 0,
      "31": 3,
      "32": 8,
      "33": 7,
      "id": 14,
      "type": "generating",
      "pId": 13,
      "f": 0.619115,
      "g": 0.885411
  },
  {
      "11": 1,
      "12": 5,
      "13": 4,
      "21": 2,
      "22": 6,
      "23": 7,
      "31": 3,
      "32": 8,
      "33": 0,
      "id": 13,
      "type": "closing",
      "pId": 9,
      "f": 0.447671,
      "g": 0.375085
  },
  {
      "11": 1,
      "12": 5,
      "13": 4,
      "21": 2,
      "22": 6,
      "23": 0,
      "31": 3,
      "32": 8,
      "33": 7,
      "id": 14,
      "type": "expanding",
      "pId": 13,
      "f": 0.0280337,
      "g": 0.766646
  },
  {
      "11": 1,
      "12": 5,
      "13": 0,
      "21": 2,
      "22": 6,
      "23": 4,
      "31": 3,
      "32": 8,
      "33": 7,
      "id": 15,
      "type": "generating",
      "pId": 14,
      "f": 0.0479291,
      "g": 0.0286752
  },
  {
      "11": 1,
      "12": 5,
      "13": 4,
      "21": 2,
      "22": 0,
      "23": 6,
      "31": 3,
      "32": 8,
      "33": 7,
      "id": 16,
      "type": "generating",
      "pId": 14,
      "f": 0.960042,
      "g": 0.87218
  },
  {
      "11": 1,
      "12": 5,
      "13": 4,
      "21": 2,
      "22": 6,
      "23": 0,
      "31": 3,
      "32": 8,
      "33": 7,
      "id": 14,
      "type": "closing",
      "pId": 13,
      "f": 0.488793,
      "g": 0.0252248
  },
  {
      "11": 1,
      "12": 5,
      "13": 4,
      "21": 2,
      "22": 0,
      "23": 6,
      "31": 3,
      "32": 8,
      "33": 7,
      "id": 16,
      "type": "expanding",
      "pId": 14,
      "f": 0.224683,
      "g": 0.0927727
  },
  {
      "11": 1,
      "12": 0,
      "13": 4,
      "21": 2,
      "22": 5,
      "23": 6,
      "31": 3,
      "32": 8,
      "33": 7,
      "id": 17,
      "type": "generating",
      "pId": 16,
      "f": 0.459689,
      "g": 0.2385
  },
  {
      "11": 1,
      "12": 5,
      "13": 4,
      "21": 2,
      "22": 8,
      "23": 6,
      "31": 3,
      "32": 0,
      "33": 7,
      "id": 18,
      "type": "generating",
      "pId": 16,
      "f": 0.988219,
      "g": 0.549594
  },
  {
      "11": 1,
      "12": 5,
      "13": 4,
      "21": 0,
      "22": 2,
      "23": 6,
      "31": 3,
      "32": 8,
      "33": 7,
      "id": 19,
      "type": "generating",
      "pId": 16,
      "f": 0.647572,
      "g": 0.88343
  },
  {
      "11": 1,
      "12": 5,
      "13": 4,
      "21": 2,
      "22": 0,
      "23": 6,
      "31": 3,
      "32": 8,
      "33": 7,
      "id": 16,
      "type": "closing",
      "pId": 14,
      "f": 0.409808,
      "g": 0.305554
  },
  {
      "11": 1,
      "12": 0,
      "13": 4,
      "21": 2,
      "22": 5,
      "23": 6,
      "31": 3,
      "32": 8,
      "33": 7,
      "id": 17,
      "type": "expanding",
      "pId": 16,
      "f": 0.815405,
      "g": 0.717622
  },
  {
      "11": 0,
      "12": 1,
      "13": 4,
      "21": 2,
      "22": 5,
      "23": 6,
      "31": 3,
      "32": 8,
      "33": 7,
      "id": 20,
      "type": "generating",
      "pId": 17,
      "f": 0.324724,
      "g": 0.687978
  },
  {
      "11": 1,
      "12": 4,
      "13": 0,
      "21": 2,
      "22": 5,
      "23": 6,
      "31": 3,
      "32": 8,
      "33": 7,
      "id": 21,
      "type": "generating",
      "pId": 17,
      "f": 0.678193,
      "g": 0.00247718
  },
  {
      "11": 1,
      "12": 0,
      "13": 4,
      "21": 2,
      "22": 5,
      "23": 6,
      "31": 3,
      "32": 8,
      "33": 7,
      "id": 17,
      "type": "closing",
      "pId": 16,
      "f": 0.498682,
      "g": 0.594689
  },
  {
      "11": 1,
      "12": 4,
      "13": 0,
      "21": 2,
      "22": 5,
      "23": 6,
      "31": 3,
      "32": 8,
      "33": 7,
      "id": 21,
      "type": "expanding",
      "pId": 17,
      "f": 0.987934,
      "g": 0.464812
  },
  {
      "11": 1,
      "12": 4,
      "13": 6,
      "21": 2,
      "22": 5,
      "23": 0,
      "31": 3,
      "32": 8,
      "33": 7,
      "id": 22,
      "type": "generating",
      "pId": 21,
      "f": 0.97782,
      "g": 0.091201
  },
  {
      "11": 1,
      "12": 4,
      "13": 0,
      "21": 2,
      "22": 5,
      "23": 6,
      "31": 3,
      "32": 8,
      "33": 7,
      "id": 21,
      "type": "closing",
      "pId": 17,
      "f": 0.817011,
      "g": 0.257924
  },
  {
      "11": 1,
      "12": 4,
      "13": 6,
      "21": 2,
      "22": 5,
      "23": 0,
      "31": 3,
      "32": 8,
      "33": 7,
      "id": 22,
      "type": "expanding",
      "pId": 21,
      "f": 0.40149,
      "g": 0.317394
  },
  {
      "11": 1,
      "12": 4,
      "13": 6,
      "21": 2,
      "22": 5,
      "23": 7,
      "31": 3,
      "32": 8,
      "33": 0,
      "id": 23,
      "type": "generating",
      "pId": 22,
      "f": 0.0763298,
      "g": 0.14632
  },
  {
      "11": 1,
      "12": 4,
      "13": 6,
      "21": 2,
      "22": 0,
      "23": 5,
      "31": 3,
      "32": 8,
      "33": 7,
      "id": 24,
      "type": "generating",
      "pId": 22,
      "f": 0.479452,
      "g": 0.873721
  },
  {
      "11": 1,
      "12": 4,
      "13": 6,
      "21": 2,
      "22": 5,
      "23": 0,
      "31": 3,
      "32": 8,
      "33": 7,
      "id": 22,
      "type": "closing",
      "pId": 21,
      "f": 0.466727,
      "g": 0.778669
  },
  {
      "11": 1,
      "12": 4,
      "13": 6,
      "21": 2,
      "22": 5,
      "23": 7,
      "31": 3,
      "32": 8,
      "33": 0,
      "id": 23,
      "type": "expanding",
      "pId": 22,
      "f": 0.165785,
      "g": 0.210175
  },
  {
      "11": 1,
      "12": 4,
      "13": 6,
      "21": 2,
      "22": 5,
      "23": 7,
      "31": 3,
      "32": 0,
      "33": 8,
      "id": 25,
      "type": "generating",
      "pId": 23,
      "f": 0.84934,
      "g": 0.152557
  },
  {
      "11": 1,
      "12": 4,
      "13": 6,
      "21": 2,
      "22": 5,
      "23": 7,
      "31": 3,
      "32": 8,
      "33": 0,
      "id": 23,
      "type": "closing",
      "pId": 22,
      "f": 0.902319,
      "g": 0.086006
  },
  {
      "11": 1,
      "12": 4,
      "13": 6,
      "21": 2,
      "22": 5,
      "23": 7,
      "31": 3,
      "32": 0,
      "33": 8,
      "id": 25,
      "type": "expanding",
      "pId": 23,
      "f": 0.157621,
      "g": 0.0856888
  },
  {
      "11": 1,
      "12": 4,
      "13": 6,
      "21": 2,
      "22": 0,
      "23": 7,
      "31": 3,
      "32": 5,
      "33": 8,
      "id": 26,
      "type": "generating",
      "pId": 25,
      "f": 0.4595,
      "g": 0.93117
  },
  {
      "11": 1,
      "12": 4,
      "13": 6,
      "21": 2,
      "22": 5,
      "23": 7,
      "31": 0,
      "32": 3,
      "33": 8,
      "id": 27,
      "type": "generating",
      "pId": 25,
      "f": 0.369479,
      "g": 0.415776
  },
  {
      "11": 1,
      "12": 4,
      "13": 6,
      "21": 2,
      "22": 5,
      "23": 7,
      "31": 3,
      "32": 0,
      "33": 8,
      "id": 25,
      "type": "closing",
      "pId": 23,
      "f": 0.609693,
      "g": 0.246135
  },
  {
      "11": 1,
      "12": 4,
      "13": 6,
      "21": 2,
      "22": 0,
      "23": 7,
      "31": 3,
      "32": 5,
      "33": 8,
      "id": 26,
      "type": "end",
      "pId": 25,
      "f": 0.4595,
      "g": 0.93117
  }
]

processTree(tileEvents)