var React = require("react");
var Basic = require("./Basic");
var Global = require("./Global");

React.render(
  <Basic />, 
  document.getElementById('basic')
);

React.render(
  <Global />, 
  document.getElementById('global')
); 

