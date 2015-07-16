# React Inline Style

[![npm version](https://badge.fury.io/js/react-inline-style.svg)](http://badge.fury.io/js/react-inline-style)

- [About](#about)
- [Features](#features)
- [Basic Usage](#basic-usage)
- [Style Definition](#style-definition)
- [Style Application](#style-application)
- [Inheritance](#inheritance)
- [Namespaces / Nesting Styles](#namespaces--nesting-styles)
  - [styleNamespace Property](#stylenamespace-property-namespacing-from-outside-a-component)
- [Global Styles](#global-styles)
- [Conditionals / :pseudo classes](#conditionals--pseudo-classes)
- [Extend Style Classes](#extend-style-classes)
- [API](#api)
  - [Style.define();](#styledefine--namespace--styles)
  - [Style.global();](#styleglobal--namespace--styles)
  - [this.style();](#thisstyle-styleclass--styledefinition--stylegroup-)
  - [this.style.define();](#thisstyledefine--namespace--styles)
  - [this.style.log();](#thisstylelog)
- [License](#license)


## About

Inline styles are great for distributed react components via npm or just reusable components in general. Having everything you need to run the component requirable within javascript improves its usability greatly. Having to look for an external css file in the _node_modules_ folder sucks.

However using inline styles, we quickly run into multiple problems. The main one being the missing possibility to adjust styles from outside the component but also the missing pseudo classes (mainly :hover) and media queries can sometimes be really handy and are duly missed. And while these last two can be substituted with javascript, there are situations where _global_ css is needed (think: HTML API responses, 3rd party plugins etc).

There is a lot of discussion going on about these problems and the missing modularity of css in general. <br> 
Check out [@Vjeux on CSS in JS](http://blog.vjeux.com/2014/javascript/react-css-in-js-nationjs.html) as a good starting point.

__React Inline Style focuses on reusable, self contained components, that dont require any external css file but are still adaptable and styleable by their owner / end user / developer.__

## Features

__React Inline Style__ provides a practical solution for the following problems:

1. Define ALL styles in JavaScript within the component/module.
3. Owner component can influence/override its child components styles.
4. Define __global__ css rules and __media-queries__ also from within a component.
5. Easy substitution for conditional class definitions like __:hover__ and __:pressed__.


What __React Inline Style__ does not provide:

1. Export styles into global stylesheet.

## Basic Usage

_React Inline Style_ is used as `react mixin`. <br>
Styles can be defined with the `define()` methods and are applied through the style property with the `this.style()` method.

```javascript
var React = require("react");
var Style = require("react-inline-style");

Style = Style.define({  //                           <-- make sure to redefine Style with the output of Style.define()
  textComponent : {
    fontWeight:"bold",
    fontStyle:"italic"
  }
});
 
var TextComponent = React.createClass({
  
  mixins : [Style()],  //                           <-- make sure to include the mixin              

  click : function(){
    this.style.define({
      textComponent : {
        fontStyle:"normal",
        letterSpacing:"2px"
      }
    });
    this.forceUpdate();
  },

  render : function (){
    return (
      <p 
        style={this.style("textComponent")} 
        onClick = {this.click}>
          textComponent
      </p>
    );
  }

});

React.render(<TextComponent />, document.body);
```
[Demo: jsFiddle](http://jsfiddle.net/09kc4xm8/)

## Style Definition

Styles can be defined on a `module-level` or the `instance-level` of the component.

```javascript
var React = require("react");
var Style = require("react-inline-style");

Style = Style.define({...}); //             <-- module-level
 
React.createClass({
  mixins : [Style()],
  render : function (){
    
    this.style.define({...}); //            <-- instance-level
  
    [...]
  }
});
```
Styles defined on `module-level` will apply to all instances of the component (Think: Static styles)
while `instance-level` styles only apply to the current instance/placement (Think: Dynamic styles).

Both `define()` methods take the same parameters. See [API: Style.define();](#styledefine--namespace--styles) for more info.

## Style Application

Styles are applied through the `style` property with the `this.style()` method.

`this.style()` takes either "class names" whos definitions can be modified and overridden by parent/owner components, or style definitions as object literals. The later cant be overridden from the outside. 

Styles passed to `this.style()` are applied/override each other in the order they were passed in.

```javascript
var React = require("react");
var Style = require("react-inline-style");

Style = Style.define({
  myStyle : {
    fontWeight:"bold",
    color:"blue"
  }
});
 
React.createClass({
  mixins : [Style()],
  render : function (){
    return (<p style={this.style("myStyle", {color:"red"})}>textComponent</p>); 
  }
});
```
[Demo: jsFiddle](http://jsfiddle.net/uvep1v60/)

## Inheritance 

Defined styles are passed down the component tree and override its child components style definitions. This makes it possible to adjust and influence components without changing their code.

The inheritance also works through `RandomComponent`s that do neither use nor include the _react-inline-style_ mixin.

```javascript
var React = require("react");
var Style = require("react-inline-style");

var TextComponent = require("./TextComponent"); // See definition in "Basic Usage".
var RandomComponent = require("RandomComponent"); // This can be any component.

Style = Style.define({
  textComponent : {
    color : "red"
  }
});
 
var RootComponent = React.createClass({
  
  mixins : [Style()],

  render : function (){
    return (
      <RandomComponent> 
       <TextComponent \>
      </RandomComponent>
    );
  }

});

React.render(<RootComponent />, document.body);
```
[Demo: jsFiddle](http://jsfiddle.net/vwm3r8xd/)

## Namespaces / Nesting Styles

Namespacing is super useful and even necessary when using modular css.

There are two ways of namespacing a component with _React Inline Style_:

#### Namespaceing from inside a component
Within your component you can nest your style definitions in order to create namespaces:

```javascript
Style.define({

  myNamespace : {
    textComponent : {
      color :"red"
    }
  }
});

// available through

this.style("myNamespace.textComponent")
```

And namespaces can also be passed in as the first parameter:

```javascript
Style.define("myNamespace.textComponent", {
    color :"red"
});

// also available through

this.style("myNamespace.textComponent")
```

#### styleNamespace Property (Namespacing from outside a component)

When using multiple components within one parent component, namespace collisions can happen and styles can't be defined for a particular component alone.

To prevent this you can use the property `styleNamespace` to define a namespace for this component instance from the ouside:


```javascript
var React = require("react");
var Style = require("react-inline-style");

var TextComponent = require("./TextComponent"); // See definition in "Basic Usage".

Style = Style.define({
  first : {
    textComponent : {
      color : "red"
    }
  },
  second : {
    textComponent : {
      color : "blue"
    }
  }
});
 
var RootComponent = React.createClass({
  
  mixins : [Style()],

  render : function (){
    return (
     <TextComponent styleNamespace = "first" \>
     <TextComponent styleNamespace = "second" \>
    );
  }

});

React.render(<RootComponent />, document.body);
```
[Demo: jsFiddle](http://jsfiddle.net/fk9o1wqr/)

## Global Styles

In some situations global styles are necessary (3rd party html) in others they are useful or improve performance (media queries).

_React inline style_ provides the possibility to define global styles from within a component through `Style.global()`. Style definitions passed to `Style.global()` are transformed to normal css definitions and are added to the document `<head>`.

```javascript
Style.global({
  ".example" : {
    color : "red",
  
    "p, a" : {
      fontWeight:"bold"
    }
  },
  
  "@media (max-width: 600px)":{
    ".example" : {
      color:"blue"
    }
  }
});


// Becomes in <head /> 

<style id="mgy3joepeffuhaor" class="react-inline-style global-css">
  
  .example {
    color:"red";
  }
  
  .example p {
    font-weight:bold;
  }
    
  .example a {
    font-weight:bold;
  }
  
  @media (max-width: 600px) {
    .example {
      color:"blue";
    }
  }

</style>
```

`Style.global()` only exists on `module-level`. Although it can be updated at any time on `instance-level`. these styles are global and affect all instances.

## Conditionals / :pseudo classes

Using inline styles, :pseudo classes are not available. However they can be substitued easily with react's `this.state`.

Doing so, often requires tests like `this.state.hover && "hoverStyle"` to apply `hoverStyle` only if `this.state.hover` is actually `true`.

_React Inline Style_ makes this easier by reintroducing :pseudo classes. When applying a style class through `this.style()`, you can add any pseudo `:variableName` to it. Doing so results in a check for `this.state.variableName` and the styles are only applied if it returned `true`: 

```javascript
"hoverStyle:hover"    ===  this.state.hover && "hoverStyle"

"hoverStyle:myState"  ===  this.state.myState && "hoverStyle"
```

Also the two most common :pseudo classes __:hover__ and __:pressed__ are already implemented for you. Just use them and all the required event handlers will be attached once their needed and removed when their not. (Still no solution for :focus though)

[Demo: jsFiddle](http://jsfiddle.net/50fpvp6q/)

## Extend Style Classes

Style definitions can `_extend` other styles.

```javascript
Style.define({
  defaults : {
    myStyle : {
      color:"blue",
      fontWeight: "bold" 
    }
  },
  myStyle : {
    
    _extend:"defaults.myStyle",
    
    color:"red"
  }
});
```

`this.style("myStyle")` now results in:

```javascript 
{ color:"red", fontWeight:"bold" }; 
```

## API

_React Inline Style_ is a React mixin. Make sure to include it into your component:

```javascript
  Style = require("react-inline-style");

  React.createClass({
    mixins : [Style()],
    ...
  });
  
```

---

### `Style.define( [ namespace, ] styles);`

__RETURNS__ `function`__:__  New `Style` instance.<br>
Defines styles on `module-level`

__namespace__ `optional`

> TYPE `string` / `array`
> 
> Onle or multiple namespaces to encapsulate this definition
>
> ```javascript
> ["namespace", "another.namespace"]
> 
> or 
>
> "namespace, another.namespace"
> ```

__styles__ `required`

> TYPE `object`
> 
> Style definitions
>
> ```javascript
> {
>   styleClass : {
>     color: "red",
>     backgroundColor:"red",
>    
>     nestedStyle : {
>       fontWeight: "bold"    
>     }
>   },
>   anotherStyle: {
>     _extend : "styleClass.nestedStyle",
>     color: "purple"
>   }
> }
> ```   

See [Style Definition](#style-definition) for more info.

---

### `Style.global( [ namespace, ] styles);`

__RETURNS__ `function`__:__  New `Style` instance.<br>
Defines global styles that will be placed in `<head>`

__namespace__ `optional`

> TYPE `string` / `array`
> 
> Onle or multiple namespaces to encapsulate this definition
>
> ```javascript
> [".namespace", ".another .namespace"]
> 
> or 
>
> ".namespace, .another .namespace"
> ```


__styles__ `required`

> TYPE `object`
> 
> Style definitions:
>
> ```javascript
> {
>   ".styleClass" : {
>     color: "red",
>     backgroundColor:"red",
>     ...
>     ".nestedStyle" : {
>       fontWeight: "bold"    
>     }
>   },
>   ".anotherStyle": {
>     color: "purple"
>   }
> }
> ```   

See [Global Styles](#global-styles) for more info.

---

### `this.style([ styleClass, ][ styleDefinition, ][ styleGroup, ]);`

__RETURNS__ `object`__:__  Style definition.<br>
Takes any number of parameters/styles and combines them to one valid style definition that can be passed to the style property. <br>
Style definitions override each other in the order they were passed into the function.


__styleClass__ `optional`

> TYPE `string`
> 
> StyleClass string.
>
> ```javascript 
> "myStyle"
> "namespace.myStyle"
> "namespace.myStyle:hover"
> "myStyle:conditional"
> ```

__styleDefinition__ `optional`

> TYPE `object`
> 
> Style definitions
>
> ```javascript
> {
>   color: "red",
>   backgroundColor: "white",
>   fontWeight: "bold",
>   fontStyle: "italic",
> }
> ```   

__styleGroup__ `optional`

> TYPE `array`
>
> A collection of `styleClasses`, `styleDefinitions` and `styleGroups`
>
> ```javascript 
> [ "myStyle", "namespace.myStyle:hover", {color:"red"} ]
> ```

See [Style Application](#style-application) for more info.

---

### `this.style.define( [ namespace, ] styles);`

__RETURNS__ `null`<br>
Defines styles on `instance-level`

__namespace__ `optional`
> TYPE `string` / `array`
> 
> Onle or multiple namespaces to encapsulate this definition
>
> ```javascript
> ["namespace", "another.namespace"]
> 
> or 
>
> "namespace, another.namespace"
> ```

__styles__ `required`
> TYPE `object`
> 
> Style definitions
>
> ```javascript
> {
>   styleClass : {
>     color: "red",
>     backgroundColor:"red",
>     
>     nestedStyle : {
>       fontWeight: "bold"    
>     }
>   },
>   anotherStyle: {
>     _extend : "styleClass.nestedStyle",
>     color: "purple"
>   }
> }
> ```   

See [Style Definition](#style-definition) for more info.

---

### `this.style.log();`

__RETURNS__ `null`<br>
Logs the current "virtual stylesheet" and namespace into the `console`

## License

License: [MIT](http://opensource.org/licenses/MIT)

---

Released in 2015 by [Philipp Adrian](https://github.com/greenish) @ [Dow Jones](https://github.com/dowjones)














