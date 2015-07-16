(function(){

var objct = require("objct/e");

///////////////////////////////////////////////////////////////////////////////
// Initial Interface

module = module || {};

module.exports = moduleFactory;
moduleFactory.define = callPreInstance("define");
moduleFactory.global = callPreInstance("global");


if(typeof define === "function" && define.amd) {
  define(function(){return moduleFactory});
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// creates module closure

function moduleFactory() {
  var moduleStore = {};
  var moduleId = (Math.random() + 1).toString(36).substring(2);
  var globalStyles = false;
  var globalStylesUpdated = false;
  var moduleNamespace = ""; //moduleNamespace || "";

  // 1) new interface - public methods with access to moduleInstance
  var moduleInstance = function(){
    var mixin = {  
      childContextTypes: {
        reactInlineStyle: function(){} // allows everything - instead of React.PropTypes.object
      },
      contextTypes: {
        reactInlineStyle: function(){} // this avoids React dependency
      },
      propTypes : {
        styleNamespace : function(){} // these definitions are now purely for documentation
      },
      componentDidMount : callInstance("_componentDidUpdateOrMount"),
      componentDidUpdate : callInstance("_componentDidUpdateOrMount"),
      componentWillUnmount : callInstance("_componentWillUnmount"),
      getChildContext : callInstance("_getChildContext"),
      getInitialState : componentFactory
    };
    return mixin;
  }
  moduleInstance.define = preInstanceDefine;
  moduleInstance.global = preInstanceGlobal;
  
  // Return instance of factory depending of context
  return this.preMixin === true ?
    moduleInstance:
    moduleInstance();

  ///////////////////////////////////////////////////////////////////////////////    
  ///////////////////////////////////////////////////////////////////////////////
  // creates component closure. (called as getInitialState)
  // Provides access to methods via this.style. 

  function componentFactory() {
    var store = {};
    var instanceStore = {};
    var ownerStyles = {}; 
    var rootNamespace ="";
    var that;
    var requireConditionals = [];
    var conditionalsLength = 0;
    var node;

    this.style = style;
    this.style.define = define;
    this.style.log = logStyles;
    this.style._getChildContext = getChildContext;    
    this.style._componentWillUnmount = componentWillUnmount;
    this.style._componentDidUpdateOrMount = componentDidUpdateOrMount;
    return null;


    ///////////////////////////////////////////////////////////////////////////////

    function componentDidUpdateOrMount(){
      setGlobalStyles();

      node = that.getDOMNode();

      // defines eventListener for requiredConditional ("hover", "pressed")(only if changed);      
      if(conditionalsLength < requireConditionals.length) {
        for(var i=0; i<requireConditionals.length; i++) {
          switch(requireConditionals[i]) {
            case "hover":

              node.addEventListener("mouseenter", onMouseEnter);
              node.addEventListener("mouseleave", onMouseLeave);

            break;
            case "pressed":

              node.addEventListener("mousedown", onMouseDown);
              node.addEventListener("mouseup", onMouseUp);      
                 
            break;
          }
        }
        conditionalsLength = requireConditionals.length;
      }
    }

    /////////////////////////////////////////////////////////////////////////////// 
    function componentWillUnmount(){
      node.removeEventListener("mouseenter", onMouseEnter);
      node.removeEventListener("mouseleave", onMouseLeave);
      node.removeEventListener("mousedown", onMouseDown);
      node.removeEventListener("mouseup", onMouseUp);
    }

    ///////////////////////////////////////////////////////////////////////////////
    // this.style.define()

    function define(namespace, styles){
      if(typeof styles === "undefined") {
        styles = namespace;
        namespace = "";
      }
      if(typeof namespace === "string") {
        namespace = namespace.split(",");
      }
      for(var i=0; i<namespace.length; i++) {
        saveStyles(namespace[i], styles, store);
      };
    }

    ///////////////////////////////////////////////////////////////////////////////
    // Handles "inheritance" of styles down the component tree

    function getChildContext(){
      that = this;

      // get react-inline-style context
      this.context.reactInlineStyle = this.context.reactInlineStyle || {};
      var context = this.context.reactInlineStyle;
      context[this._reactInternalInstance._mountOrder] = context[this._reactInternalInstance._mountOrder] || {};
      var thisContext = context[this._reactInternalInstance._mountOrder];
      
      // get parent styles
      var id, parent = this._reactInternalInstance;
      var parentStyles = false;

      while(parent._currentElement._owner) {
        parent = parent._currentElement._owner;
        id = parent._mountOrder;
        if(typeof context[id] === "object" && typeof context[id].ownerStyles === "function") {
          parentStyles=context[id];
          break;
        }
      }

      // define componentInstance styles
      if(parentStyles) {
        ownerStyles = parentStyles.ownerStyles();
        rootNamespace = parentStyles.rootNamespace || "";
      }

      // apply root namespace
      var namespace = "";
      if(typeof this.props.styleNamespace === "string") {
        namespace = getNamespace(this.props.styleNamespace);
        ownerStyles = getClassFromString(namespace, ownerStyles);
      }

      rootNamespace = getNamespace(rootNamespace, namespace);

      // copy styles from moduleInstance to componentInstance
      new objct.e.extend(store, objct.e.deep(moduleStore), objct.e.deep(instanceStore));

      // pass on component styles
      context[this._reactInternalInstance._mountOrder]={
        ownerStyles : objct.e(store, objct.e.deep(ownerStyles)),
        rootNamespace : rootNamespace
      }

      return {
        reactInlineStyle : context
      }
    }    
    
    ///////////////////////////////////////////////////////////////////////////////
    // this.style.log(): Log current virtual stylesheet 

    function logStyles(){
      if(typeof console !== "object" || typeof console.log !== "function") return;
      console.log("react-inline-style", {
        "rootNamespace" : rootNamespace, 
        "stylesheet" : new objct.e(store, objct.e.deep(ownerStyles))
      });
    }
    ///////////////////////////////////////////////////////////////////////////////
    // Add styles to store

    function saveStyles(namespace, styles, store) {
      namespace = getNamespace(namespace);
      var namespaced = addNamespace(namespace, styles);
      new objct.e.extend(store, objct.e.deep(namespaced));
      new objct.e.extend(instanceStore, objct.e.deep(namespaced));
    }

    ///////////////////////////////////////////////////////////////////////////////
    // this.style(): Merge requested component and return "flattened" styles object

    function style(){
      var styles = Array.prototype.slice.call(arguments);
      var stored = new objct.e(store, objct.e.deep(ownerStyles));
      var returnStyles = [], style, extend, k;
       
      styles = flattenArray(styles);

      // flatten css "classes" and mix everything together -> output styles {};
      for(var i = 0; i<styles.length; i++) {
        style = styles[i];
        if(typeof style === "string") {
          if(!testConditional(style)) continue;
          // add namespace
          style = getNamespace(moduleNamespace, styles[i]);
          // get class
          style = getClassFromString(style, stored);
        }
        if(typeof style === "object") {

          // EXTEND STYLE
          if(typeof style._extend !== "undefined") {
            style._extend = typeof style._extend === "string" ?
              [style._extend]:
              style._extend;

            for(k=0; k<style._extend.length; k++) {
              if(!testConditional(style._extend[k])) continue;
              // add namespace
              extend = getNamespace(moduleNamespace, style._extend[k]);
              // get class
              extend = getClassFromString(extend, stored);

              if(typeof extend === "object"){
                returnStyles.push(extend);
              }
            }
          }

          returnStyles.push(style);
        }
      }

      styles = new objct(returnStyles);
      
      //cleanup 
      returnStyles = {};
      for(style in styles){
        if(style !== "_extend" && (typeof styles[style] === "string" || typeof styles[style] === "number")) {
          returnStyles[style]= styles[style];
        }
      }
      return returnStyles;
    }

    ///////////////////////////////////////////////////////////////////////////////    
    function onMouseEnter(e){
      if(node !== e.target) return;
      that.setState({
        hover:true
      });
    }
    ///////////////////////////////////////////////////////////////////////////////    
    function onMouseLeave(e){
      if(node !== e.target) return;
      that.setState({
        hover:false
      });
    }
    ///////////////////////////////////////////////////////////////////////////////    
    function onMouseDown(e){
      if(!nodeContains(node, e.target) && node !== e.target) return;
      that.setState({
        pressed:true
      });
    }
    ///////////////////////////////////////////////////////////////////////////////    
    function onMouseUp(e){
      if(!nodeContains(node, e.target) && node !== e.target) return;
      that.setState({
        pressed:false
      });
    }
    ///////////////////////////////////////////////////////////////////////////////    
    // transforms "class:hover" into "this.state.hover && "class"" then returns the result

    function testConditional(style){
      style = style.split(":");
      if(style.length < 2) return true;

      var condition = style[1];
            
      if(!that.state) {
        requireConditionals.push(condition);
        return false;
      }
      if(typeof that.state[condition] === "undefined") requireConditionals.push(condition);

      return that.state[condition];
    } 

  }

  ///////////////////////////////////////////////////////////////////////////////
  // Savely try to access "path.to.object.that.might.not.exist" in store

  function getClassFromString(string, store){
    if(string=== "." || string==="") return store;
    var path = string.split(".");
    var style = store;
    for(var i=0; i< path.length; i++) {
      if(typeof style[path[i]] !== "object") return undefined;
      style = style[path[i]];
    }
    return style;
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Style.define()

  function preInstanceDefine(namespace, styles){
    if(typeof styles === "undefined") {
      styles = namespace;
      namespace = "";
    }
    if(typeof namespace === "string") {
      namespace = namespace.split(",");
    }
    for(var i=0; i<namespace.length; i++) {
        var namespaced = addNamespace(namespace[i], styles);
        new objct.e.extend(moduleStore, objct.e.deep(namespaced));
    }
    return moduleInstance;
  };

  ///////////////////////////////////////////////////////////////////////////////
  // Style.global()

  function preInstanceGlobal(namespace, styles) {
    if(typeof styles === "undefined") {
      styles = namespace;
      namespace = "";
    }
    if(typeof namespace === "string") {
      namespace = namespace.split(",");
    }
    for(var i=0; i<namespace.length; i++) {
        var namespaced = addNamespace(namespace[i], styles);
        globalStyles = new objct.e(globalStyles || {}, objct.e.deep(namespaced));
    }
    globalStylesUpdated = true; 
    return moduleInstance;
  }

  ///////////////////////////////////////////////////////////////////////////////
  // componentDidMount && componentDidUpdate

  function setGlobalStyles(){
    if(!globalStyles || !globalStylesUpdated) return;
    var styleTag = document.getElementById(moduleId);
    if(styleTag) {
      styleTag.innerHTML = globalStylesToString(globalStyles);
    }
    else { 
      styleTag = document.createElement("style");
      styleTag.setAttribute("id", moduleId);
      styleTag.setAttribute("class", "react-inline-style global-css");
      styleTag.innerHTML = globalStylesToString(globalStyles);
      document.head.appendChild(styleTag);
    }
    globalStylesUpdated = false;
  }

  ///////////////////////////////////////////////////////////////////////////////

}

///////////////////////////////////////////////////////////////////////////////
// Add namespace to object

function addNamespace(namespace, obj){
  if(namespace === "") return obj;
  var namespaced={};
  var parts = namespace.split(".");
  var position = namespaced;
  var part= parts.shift();
  var nextPart;

  while(part) {
    if(typeof position[part] !== "object"){
      position[part]={};
    }
    nextPart= parts.shift();
    if(!nextPart) {
      position[part] = obj;
    }
    else {
      position = position[part];
    }
    part = nextPart;
  }
  return namespaced;
}

///////////////////////////////////////////////////////////////////////////////
// Call "method" inside componentInstance through reference on this.style

function callInstance(method){
  return function(){
    return this.style[method].apply(this, arguments);
  }
}

///////////////////////////////////////////////////////////////////////////////
// Create moduleInstance with preMixin context then call "method"

function callPreInstance(method){
  return function(){
    var moduleInstance = moduleFactory.apply({preMixin : true});
    moduleInstance[method].apply(this, arguments);
    return moduleInstance;
  }
}

///////////////////////////////////////////////////////////////////////////////
// returns the correct combined namespace from all passed namespaces

function getNamespace() {
  var namespace="", argument;
  for(var i=0; i<arguments.length; i++){
    if(typeof arguments[i] !== "string") continue;

    argument = arguments[i].split(":")[0];

    if(argument.charAt(0) === ".") {
      namespace = argument.substring(1);
    }
    else if(namespace !== ""){
      namespace += "."+argument;
    }
    else {
      namespace = argument;
    }
  }
  return namespace;
}

///////////////////////////////////////////////////////////////////////////////
// [1,[2,3,[4],5],6,7] => [1,2,3,4,5,6,7]

function flattenArray(array){
  for(var i =0; i<array.length; i++){
    if(objct.isArray(array[i])){
      Array.prototype.splice.apply(array, [i,1].concat(array[i]));
      i--;
    }
  }
  return array;
}

///////////////////////////////////////////////////////////////////////////////
// Transform globalStyles Object to string 
// { ".classname": { color : "green"}} => ".className { color : 'green'; }"
 
function globalStylesToString(obj){
  var string = " ";
  var child, children, definitions, cssClasses, i;
  for(var cssClass in obj) {
    children = " ";
    definitions = "";
    for(var style in obj[cssClass]) {
      if(typeof obj[cssClass][style] === "object") {
        child = {};
        // handle media queries
        if(cssClass.search("@media")>=0) {
          child[style] = obj[cssClass][style];
          definitions += globalStylesToString(child);
          continue;
        }
        // handle nested style
        else {
          child[cssClass+" "+style] = obj[cssClass][style];
          children += globalStylesToString(child);
          continue;
        }
      }
      // handle normal style
      else {
        definitions += style.replace(/(ms)?([A-Z])/g, function(match, ms, letter){
          ms = ms ? "-"+ms : "";
          return ms+"-"+letter.toLowerCase();
        });
        definitions += ":"+obj[cssClass][style]+"; ";
      }
    }
    if(definitions !== "") {
      cssClasses = cssClass.split(",");
      for(i=0; i<cssClasses.length; i++) {
        string+= cssClasses[i]+" { "+definitions+"} ";
      }
    }
    string += children;
  }
  return string;
}
///////////////////////////////////////////////////////////////////////////////
function nodeContains(parent, child) {
  while((child=child.parentNode)&&child!==parent); 
  return !!child; 
}
///////////////////////////////////////////////////////////////////////////////
})();