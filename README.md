![GitHub release](https://img.shields.io/github/release/gogocat/dataBind.svg)
![coverage](https://img.shields.io/badge/coverage-70%25-green.svg?cacheSeconds=2592000)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/e754785d29d946bf9a0ab7146869caec)](https://www.codacy.com/app/gogocat/dataBind?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=gogocat/dataBind&amp;utm_campaign=Badge_Grade)
![GitHub](https://img.shields.io/github/license/gogocat/dataBind.svg)

## What is dataBind?

dataBind is a light weight javaScript [MV* framework](http://www.techbloginterview.com/what-is-a-mv-framework/) aim for update DOM easier and in better managed way.

* **Declarative:** dataBind simpliy bind view data to the HTML, wire events, and provides two way or one way data binding
* **High performance:** dataBind is very fast. Please do try the famous [**dbmonster** example](https://gogocat.github.io/dataBind/examples/dbmonsterForOf.html), locate in `examples/dbmonsterForOf.html` and [**fiber**](https://gogocat.github.io/dataBind/examples/fiber-demo.html) `/examples/fiber-demo.html` compare with [other frameworks](http://mathieuancelin.github.io/js-repaint-perfs/)
* **DOM is the source of truth:** There is no vitrual DOM or complex reactive observables to worry about
* **Isolated scope:** Each component only works with its own viewModel scope. No complex props pass up and down
* **zero setup:** There is no need to run any build tool for development or production
* **framework agnostic :** dataBind can work with any other framework. There is no need to rebuild everything in order to use it. It is design to leverage and modernise what is already working


## How to use it?
The following is a very simple example shows text binding. 

Most of the component logic will be in the viewModel(plain old JavaScript object).

`dataBind.init` will return an instance of `Binder`(this is the bound dataBind object).
Then just call `render` to start render to the page.

**HTML**
```html	
<section data-jq-comp="simpleComponent">
    <div>
        <h5 data-jq-text="heading"></h5>
        <p data-jq-text="description"></p>
    </div>
</section>
```
**Js**
```javascript

const simpleComponentViewModel = {
    heading: 'Test heading',
    description: 'This is my test description',
};

// init data bind with view
const simpleComponent = dataBind.init(document.querySelector('[data-jq-comp="simpleComponent"]'), simpleComponentViewModel);

// trigger render and log after render
simpleComponent.render().then(function() {
    // for debug
    console.log(simpleComponent);
});

```
To make change, just update the data in viewModel and then call `render()`.
```javascript		
simpleComponentViewModel.heading='new heading';

simpleComponent.render();
```
`render` function is an asynchronous, debounced operation. So it will consolidate changes and render only once.

> :bulb: *All declarative bindings accept value or function that returns value from the viewModel*.

Example: `heading` in the viewModel can be a value or function that returns value.

The binding can also pass-in parameters. 
 ```html
<h5 data-jq-text="heading($data)"></h5>
```
The following parameters are helpers reference `$index` or `$data` or `$root`. More details below


For more advance example. Please check [**examples/bootstrap.html**](https://gogocat.github.io/dataBind/examples/bootstrap.html). 

> *bootstrap example shows how to use multiple, nested components and services together. Please run this example from a local server*.

----

### The init and render functions
```javascript
...
// DOM ready bind viewModel with target DOM element
const simpleComponent = dataBind.init(document.querySelector('[data-jq-comp="simpleComponent"]'), simpleComponentViewModel);

// trigger render, then console log for debug
simpleComponent.render().then(function(ctx) {
    // for debug
    console.log(simpleComponent === ctx);
});
...
```
In this simple example. First we call `.init` to initialise the component with the viewModle:
```javascript
const simpleComponent = dataBind.init([targetDOMElement], [viewModel]);
```
The returned value of `dataBind.init` is a instance of `Binder`, which is the bound component. Behind the scene, dataBind will parse the target DOM element and cache elements that has binding attributes and wire up with the viewModel. At this stage it doesn't make any change to the DOM.

The next call of `render` function is to render value from viewModel to the DOM (if there are difference). It returns a `promise` object for logic that can be trigger after the component fully rendered.

The resolver callback will receive a `context` object; because inside the resolver function `this` is refer to window.
`context` object is the same object as `simpleComponent` in this example. 

To re-render the component, just call `render`. As mentioned, this function is an asynchronous and debounced operation. This mean, doesn't matter how many times it get call it will only make change to DOM once. Minimise browser repaint/reflow.

For edge case; pass an optional setting object when calling `render` to control what binding should be render or not.
```javascript
simpleComponent.render({
    templateBinding: true,
    textBinding: true,
    cssBinding: true,
    ifBinding: true,
    showBinding: true,
    modelBinding: true,
    attrBinding: true,
    forOfBinding: true,
    switchBinding: true,
    changeBinding: true,
    clickBinding: true,
    dblclickBinding: true,
    blurBinding: true,
    focusBinding: true,
    hoverBinding: true,
    submitBinding: true,
});
```
**Overwrite 'data-jq-x` namespace and underscore template settings**
```javascript
// global dataBind settings
dataBind.use({
    bindingAttrs: {
        comp: 'data-xy-comp',
        tmp: 'data-xy-tmp',
        text: 'data-xy-text',
        click: 'data-xy-click',
        dblclick: 'data-xy-dblclick',
        blur: 'data-xy-blur',
        focus: 'data-xy-focus',
        hover: 'data-xy-hover',
        change: 'data-xy-change',
        submit: 'data-xy-submit',
        model: 'data-xy-model',
        show: 'data-xy-show',
        css: 'data-xy-css',
        attr: 'data-xy-attr',
        forOf: 'data-xy-for',
        if: 'data-xy-if',
        switch: 'data-xy-switch',
        case: 'data-xy-case',
        default: 'data-xy-default'
    },
    templateSettings: {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /\{\{=(.+?)\}\}/g,
        escape: /\{\{(.+?)\}\}/g,
    };
});

// init
const simpleComponent = dataBind.init(document.querySelector('[data-jq-comp="simpleComponent"]'), simpleComponentViewModel);
// render
simpleComponent.render();
```
dataBind `use` method can be use to set global setting of binding attribute namespace. It accept an option object showing in above example.
It also can use to overwrite **underscore** interpolate settings.

## Visual bindings
The following bindings produce visual changes

### Template binding
```html
<section data-jq-comp="simpleComponent" data-jq-tmp="{id: 'exampleTemplate', data: '$root'}">
</section>

<template id="exampleTemplate">
    <h1 data-jq-text="heading"></h1>
</template>
```
The attribute `data-jq-tmp` accept a JSON like object. `id` is reference to the `template` element id. `data` is reference to the data object within the bound viewModel. In this example `$root` means the root of the viewModel itself.
If there a 3rd option as `append: true` or `prepend: true`, the content will then append or preprend to the target container (the section tag in this example). This make building infinity scroll content very easy and efficient.

dataBind also support Underscore/Lodash template intepolation.
```html
<script type="html/text" id="exampleTemplate">
    <h1 data-jq-text="heading"></h1>
    {{description}}
</script>
````
> :warning: *Support for Underscore/Lodah template will likely to be drop in the future release.*

### Text binding
```html
<h1 data-jq-text="heading"></h1>

<h1 data-jq-text="fullName | uppercase"></h1>
```
The attribute `data-jq-text` is refernce to the viewModel's property '**heading**'. All binding can handle deep object path reference eg. `data-jq-text="childObj.myArray[1].heading"`

The 2nd example shows usage of **filter** ' | '. The value from viewModel's property `fullName` will pass on to the viewModel's `uppercase` function that returns value to be display. Filters can be chain together one after the other. more detail below.
    
### css binding
```html
<h1 data-jq-css="mycCss"></h1>
```
The attribute `data-jq-css` is refernce to the viewModel's property '**mycCss**'. This property can be a string of css class name, an object represend mutilple css class toggle eg. `{css1: true, css2: false}` or a function that returns either string or the object.

### if binding
```html
<h1 data-jq-if="myCondition">
    <span>Hello</span>
</h1>

<div data-jq-if="!myCondition" data-jq-tmp="{id: 'someTemplateId', data: 'someData'}"></div>
```
The attribute `data-jq-if` is refernce to the viewModel's property '**myCondition**'. This property can be a boolean or a function that returns boolean.

If `myCondition` is false. the children elements will be removed from DOM. When later `myCondition` is set to true. The elements will then render back.

With negate expression(second example above), when the expression `!myCondition` evaluate to true. The template binding `data-jq-tmp` will execute and render accordingly.

[example](https://gogocat.github.io/dataBind/examples/ifBinding.html)

### show binding
```html
<h1 data-jq-show="isShow">
    <span>Hello</span>
</h1>
```
The attribute `data-jq-show` is refernce to the viewModel's property '**isShow**'. This property can be a boolean or a function that returns boolean. If `isShow` is `true` the element will be display, otherwise it will be hidden. It also can handle negate expression eg `!isShow`. 

### model binding
```html
<input id="userName" name="userName" type="text" 
    data-jq-model="personalDetails.userName"
    data-jq-change="onInputChange" 
required>
```
The attribute `data-jq-model` is refernce to the viewModel's property '**personalDetails.userName**'. This property can be a string or a function that returns string. Model binding is a one-way binding operation that populate the input field `value` attribute with value come from the viewModel.

**data-jq-model**
> viewModel -> DOM

For two-way data binding; use together with `data-jq-change`. It will update the viewModel if the value has changed and then trigger the event handler `onInputChange`. More detail below.

**data-jq-change**
> DOM -> viewModel

[example](https://gogocat.github.io/dataBind/examples/todomvc.html)

### attribute binding
```javascript
<img data-jq-attr="getImgAttr">

// js
let viewModel = {
    getImgAttr: function(oldAttrObj, $el) {
            return {
                src: '/someImage.png',
                alt: 'some image',
            };
        }
    }
};
```
The attribute `data-jq-attr` is refernce to the viewModel's property '**getImgAttr**'. This property can be a object or a function that returns object with `key:value`. The key is the attribute name and value is the value of that attribute.

attribute binding is useful for more complex usage together with `data-jq-for` binding.
Please see the `<select>` elements in this [example](https://gogocat.github.io/dataBind/examples/forOfBindingComplex.html)

### forOf binding

```javascript
<p data-jq-for="result of results" data-jq-text="result.content"></p>

// js
let viewModel = {
    results: [
        {content: '1'},
        {content: '2'},
        {content: '3'}
    ]
};
```
The attribute `data-jq-for` is refernce to the viewModel's property '**results**'. It will then loop throught the data and repeat the element. The express also accept 'for-in' syntax eg `result in results`.

The result will looks like this:
```html
<!--data-forOf_result_of_results-->
    <p data-jq-text="result.content">1</p>
    <p data-jq-text="result.content">2</p>
    <p data-jq-text="result.content">3</p>
<!--data-forOf_result_of_results_end-->
```
[example](https://gogocat.github.io/dataBind/examples/forOfBinding.html)

### switch binding
```javascript
<div data-jq-switch="selectedStory">
    <div data-jq-case="s1">
        <h2>Case 1</h2>
    </div>
    <div data-jq-case="s2">
        <h2>Case 2</h2>
    </div>
    <div data-jq-case="s3">
        <h2>Case 3</h2>
    </div>
    <div data-jq-default="">
        <p>No story found...</p>
    </div>
</div>

// js
let viewModel = {
    selectedStory: 's1'
};
```
Switch binding is a specail binding that the bound element must be parent of `data-jq-case` or `data-jq-default` binding elements, and each `data-jq-case`  or `data-jq-default` must be siblings.

The attribute `data-jq-switch` is refernce to the viewModel's property '**selectedStory**'. This property can be a string or a function that returns a string. 

In this example the result will looks like this, since selectedStory` match `data-jq-case="s1"`.
```html
<div data-jq-switch="selectedStory">
    <div data-jq-case="s1">
        <h2>Case 1</h2>
    </div>
</div>
```
[example](https://gogocat.github.io/dataBind/examples/switchBinding.html)

## Event bindings
The following binding produce interactivities

### change binding
```javascript
<input id="new-todo" type="text" 
       data-jq-change="onAddTask" 
       placeholder="What needs to be done?" 
       autofocus>

// js
let viewModel = {
    onAddTask: function(e, $el, newValue, oldValue) {
        // do something...
    },
}
```
`data-jq-change` binding is use form input elements(input, checkbox, select..etc) on change event. The bound viewModel handler `onAddTask` will receive the `event object`, `bound DOM element (not jQuery object)`, `new value` and the `old value`.

To make things more flexible. `data-jq-change` is one way binding (Data flows from DOM to viewModel).
For 2 way binding, please use Model binding together. Which does data flow from viewModel to DOM.

```javascript
<div data-jq-comp="todoComponent">
    <input id="new-todo" type="text" 
           data-jq-change="onAddTask" 
           data-jq-model="currentTask"
           placeholder="What needs to be done?" 
           autofocus>
</div>
// js

const viewModel = {
    currentTask = '',
    onAddTask: function(e, $el, newValue, oldValue) {
        e.preventDefault();
        this.currentTask = newValue;
        // re-render
        this.APP.render();
    }
}


// init data bind with view
const toDoApp = dataBind.init(document.querySelector('[data-jq-comp="todoComponent"]'), viewModel);
// trigger render
toDoApp.render();

```
In this example, we update `currentTask` data whenever `onAddTask` get called(on change) then calls `this.APP.render()`. 

> Once the viewModel bound with `dataBind.init` call, the viewModel will be extended. `APP` property is the bound dataBind object. 

### click binding
```javascript
 <button id="clear-completed" data-jq-click="onClearAllCompleted">
     Clear completed
 </button>
 
 // js
let viewModel = {
    onClearAllCompleted: function(e, $el) {
        // do something...
    }
}
```
`data-jq-click` binding is an event handler binding for 'click' event. The handler will receive ` event object ` and the `DOM element(not jQuery object)`.

### dblclick binding
```javascript
 <button id="clear-completed" data-jq-dblclick="onDoubleClicked">
     Clear completed
 </button>
 
 // js
let viewModel = {
    onDoubleClicked: function(e, $el) {
        // do something...
    }
}
```
`data-jq-dblclick` binding is an event handler binding for double click event. The handler will receive ` event object ` and the `DOM element(not jQuery object)`.

### blur binding
```javascript
 <input name="firstName" type="text" data-jq-blur="onBlur">
 
// js
const viewModel = {
    onBlur: function(e, $el) {
        // do something...
    }
}
```
`data-jq-blur` binding is an event handler binding for 'blur' event. The handler will receive ` event object ` and the `DOM element(not jQuery object)`.

### focus binding
```javascript
 <input name="firstName" type="text" data-jq-focus="onFocus">
 
 // js
const viewModel = {
    onFocus: function(e, $el) {
        // do something...
    }
}
```
`data-jq-focus` binding is an event handler binding for 'focus' event. The handler will receive ` event object ` and the `DOM element(not jQuery object)`.
### hover binding
```javascript
<div data-jq-hover="onHover">Hi</div>

 // js
const viewModel = {
    onHover:{
        in: function(e, $el) {
            // do something when mouse in
        },
        out: function(e, $el) {
            // do something when mouse out
        }
    }
}
```
`data-jq-hover` binding is an special event handler binding for 'mouseenter' and 'mouseleave' events. The binding property must be a object with `in` and `out` functions. Each function will receive ` event object ` and the `DOM element(not jQuery object)`.

### submit binding
```javascript
<form id="my-form" data-jq-submit="onSubmit">
    ...
</form>

// js
const viewModel = {
    onSubmit: function(e, $el, formData) {
        // do something...
    }
}
```
`data-jq-focus` binding is an event handler binding for 'submit' event. The handler will receive ` event object ` and the `DOM element(not jQuery object)` and a JSON object represent the form data.

### Filter
```javascript
<p>Price: <span data-jq-text="story.price | toDiscount | addGst"></span></p>

// js
const viewModel = {
    gstRate: 1.1,
    discountRate: 10,
    story: {
        price: 100
    },
    toDiscount: function(value) {
        return Number(value) * this.discountRate;
    },
    addGst: function(value) {
        return Number(value) * this.gstRate;
    },
}
```
Filter is a convenient way to carry a value and run through series of functions. In this example `data-jq-text` binding refernce to the viewModel property `story.price`. With the ` | ` filter annotation, the value `100` will then pass to `toDiscount` method, and then `addGst` methods. The last fitler's value will then use for display.
'Filter' is just simple function that recevie a value and return a value. 

### $data, $root and $index
```javascript
<div data-jq-for="question of questions">
    <label data-jq-text="question.title"
           data-jq-attr="getQuestionLabelAttr($data, $index)"
           data-jq-css="$root.labelCss"
    >
    </label>
    <input type="text" data-jq-attr="getQuestionInputAttr($data, $index)">
</div>

// js
const viewModel = {
    labelCss: 'form-label',
    questions: [
        {
            title: 'How are you?',
            fieldName: 'howAreYou'
        }
    ],
    getQuestionLabelAttr: function(data, index, oldAttr, $el) {
        return {
            'for': `${data.fieldName}-${index}`
        };
    },
    getQuestionInputAttr: function(data, index, oldAttr, $el) {
       return {
            'name': `${data.fieldName}-${index}`
            'id': `${data.fieldName}-${index}`
        };
    },
}
```
When using `data-jq-for` binding, `$data` is refer to the current data in the loop. `$index` is refer to the current loop index
`$root` is refer to the viewModel root level.

### One time binding
```javascript
<div data-jq-if="renderIntro | once">
    <h1>Introduction</h1>
</div>

// js
let viewModel = {
    renderIntro: false
}
```
`once` is a reserved word in Filter logic, which does one time only binding. In this example because `renderIntro` is false. `data-jq-if` will not render the bound element, and because it has filter of `once`. It will not re-render the element anymore even later  `renderIntro` is set to `true`. dataBind actually unbind the element after first render.

### Communicate between components
dataBind use pub/sub pattern to cross comminicate between components. In the [**bootstrap examples**](https://gogocat.github.io/dataBind/examples/bootstrap.html)
```javascript
const compSearchBar = dataBind.init(document.querySelector('[data-jq-comp="search-bar"]'), viewModel);
compSearchBar.render().then(function(comp) {
    let self = comp;
    compSearchBar.subscribe('SEARCH-COMPLETED', self.viewModel.onSearchCompleted);
});

\\ compSearchResults.js
...
compSearchResults.publish('SEARCH-COMPLETED', data);
..
```
Search bar component subscribed ` SEARCH-COMPLETED` event with `onSearchCompleted` as handler after the initial `render` call.

Late on, `compSearchResults` component **publish** `SEARCH-COMPLETED` event with data. Which will then trigger **compSearchBar** component's `onSearchCompleted` handler.

> Notice the event publisher and the event subscriber are the individual component. There is no central pub/sub channel. So multiple components can subscribe a same event and can be unsubscribe individually.

Supported events are 
- **subscribe**  - component subscribe an event
- **subscribeOnce** - component subscribe an event only once
- **unsubscribe** - component unsubscribe an event
- **unsubscribeAll** - component unsubscribe all events
- **publish** - component publish an event

### Server side rendering and rehydration
dataBind respect any server sider rendering technology. Just mark the component with `data-server-rendered` attribute.
```html
<div data-jq-comp="search-bar" data-server-rendered>
    ...
</div>
```
**Rehydration** - 
When dataBind parse a component that has `data-server-rendered` attribute. dataBind will not render on the initial call of `render`, but will parse all the bindings.

Next time calling `render` method will then update the view according to the viewModel.

> The viewModel should has exact same data as the server side rendered version. So when later on calls `render` the content will update correctly. 

*Currently rehydration for **if, forOf and switch** bindings are still work in progress.*

## What dataBind is good for
dataBind is designed for leaverage existing infrastructure. 
It is good fit for web sites that is:
- already [using jQuery (72%)](https://trends.builtwith.com/javascript/jQuery).
- has exisitng server side render technology eg. PHP, .Net, JSP etc
- quickly build something to test the market but maintainable and easy to unit test

### what not
- new project - Angular, Aurelia or React... may be a better choice
- dataBind is not an full stack soultion
- micro component base - dataBind's component concept is not aim to be as small as a `<p>` tag seen in some library

## What's next?
- Remove jQuery dependency
- The next major version, already on the way, will implement dataBind with native [web component](https://developer.mozilla.org/en-US/docs/Web/Web_Components). This will make micro component concept super easy, truely portable.

----
## LICENSE
[MIT](https://gogocat.github.io/dataBind/LICENSE.txt).
