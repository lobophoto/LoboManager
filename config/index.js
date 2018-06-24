const _ = require('lodash');

try{
  const defaultConfig = require('./config.default.js');
  const config = require('./config.js');
  module.exports = _.merge(defaultConfig, config);
}catch(e){
  const defaultConfig = require('./config.default.js'); 
  module.exports = defaultConfig;
}