import config from '../config';

export default function(mapType, dimension){
  if(mapType=='grid'){
    if(dimension <= 128){
      config.nodeSize = 20;
    }
    else if(dimension <= 256){
      config.nodeSize = 15;
    }
    else if(dimension <= 512){
      config.nodeSize = 10;
    }
    else{
      config.nodeSize = 5;
    }
  }
  if(mapType=='mesh'){
    if(dimension <= 5000){
      config.nodeSize = 20;
    }
    else if(dimension <= 10000){
      config.nodeSize = 15;
    }
    else if(dimension <= 15000){
      config.nodeSize = 10;
    }
    else{
      config.nodeSize = 5;
    }
  }
  if(mapType=='roadnetwork'){
    config.nodeSize = 1;
  }
}
