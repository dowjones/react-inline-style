var React = require("react");
var BasicModifier = require("./BasicModifier");
var BasicModifier2 = require("./BasicModifier2");
var TextComponent = require("./TextComponent");
var Style = require("../react-inline-style");
///////////////////////////////////////////////////////////////////////////////
Style.debug=true;
Style = Style.define({
  root : {
    cursor:"pointer",
    
    title : {
      fontFamily : "Arial, sans-serif",
      fontWeight : "bold",
      color:"grey"
    }
  },
  
  standardFont: {
    fontSize:"16px",
    fontFamily:"Arial, sans-serif"
  },

  textComponent: {
    textDecoration:"underline",
    textAlign : "right"
  },

  special : {
    textComponent: {
      color:"purple",
      fontSize:"24px",
      fontWeight:"bold"
    }
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
  this.style.define({
    textComponent : {
       backgroundColor: "lightgrey",
       color: "yellow"
    },

    root: {
      clicked : {
        color:"orange",
        textDecoration : "underline"
      }
    }
  });
  this.forceUpdate();
}
///////////////////////////////////////////////////////////////////////////////
function render(){

  return (
    <div style={this.style("root")} onClick={this.click}>
      <p style={this.style("root.title", "root.clicked:pressed")}>Basic:</p>
      <TextComponent />
      <BasicModifier />
      <BasicModifier2 />
      <TextComponent cssNamespace="special" />
    </div>
  );
}

