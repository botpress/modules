const EventEmitter = require('eventemitter2');

class Analytics extends EventEmitter {
  constructor(skin) {
    super();

    if (!skin){
      throw new Error('You need to specify skin');
    }

    this.app = skin.getRouter('skin-analytics');

    this.graphsData = {data:'hello'}
  }

  getGraphsData(){
    return this.graphsData
  }
}

module.exports = Analytics;
