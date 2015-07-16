var React = require("react");
var BasicModifier = require("./BasicModifier");
var BasicModifier2 = require("./BasicModifier2");
var TextComponent = require("./TextComponent");
var Style = require("../react-inline-style");
///////////////////////////////////////////////////////////////////////////////

Style = Style.global({
  "#global" : {
    cursor:"pointer"
  },
  "#global p:first-child" : {
    fontFamily : "Arial, sans-serif",
    fontWeight : "bold",
    color:"grey"
  }
});

///////////////////////////////////////////////////////////////////////////////

module.exports = React.createClass({
  mixins : [Style()],
  click : click,
  render : render
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
function click(){
  Style.global({
    "#global p:first-child" : {
      color:"orange",
      textDecoration : "underline"
    },    

    "#global .textComponent" : {
       backgroundColor: "lightgrey",
       color: "yellow"
    }

  });
  this.forceUpdate();
}
///////////////////////////////////////////////////////////////////////////////
function render(){

  return (
    <div onClick={this.click}>
      <p style={this.style("title", "clicked")}>Gobal:</p>
      <TextComponent />

    </div>
  );
}

