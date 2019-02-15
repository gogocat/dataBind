## What is dataBind?

dataBind is a light weight JavaScript MV* framework aim for modernise how [web sites that use jQuery](https://trends.builtwith.com/javascript/jQuery).

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
    let simpleComponent;
    const simpleComponentViewModel = {
        heading: 'Test heading',
        description: 'This is my test description',
    };
    // start binding on DOM ready
    $(document).ready(() => {
        // init data bind with view
        simpleComponent = dataBind.init($('[data-jq-comp="simpleComponent"]'), simpleComponentViewModel);
        
        // trigger render and log after render
        simpleComponent.render().then(function() {
            // for debug
            console.log(simpleComponent);
        });
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

The 2nd example shows usage of **filter** ` | `. The value from viewModel's property `fullName` will pass on to the viewModel's `uppercase` function that returns value to be display. Filters can be chain together one after the other. more detail below.
    
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
    let toDoApp;
    let viewModel = {
        currentTask = '',
        onAddTask: function(e, $el, newValue, oldValue) {
            e.preventDefault();
            this.currentTask = newValue;
            this.updateView();
        },
        updateView(opt) {
            // re-render
            this.APP.render(opt);
        }
    }
    
     $(document).ready(() => {
        // init data bind with view
        toDoApp = dataBind.init($('[data-jq-comp="todoComponent"]'), viewModel);
        // trigger render
        toDoApp.render();
    });
```
In this example, we update `currentTask` data whenever `onAddTask` get called(on change). `updateView` method then calls `this.APP.render(opt)`. 

> Once the viewModel bound with `dataBind.init` call, the viewModel will be extended. `APP` property is the bound dataBind object.
The `render` method accept an optinal object. This object flags what kind binding should be re-render. Making it very flexible to fine tune what needs to be update or not. By default, dataBind will re-render all bindings and only update the changed DOM elements.  

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
    let viewModel = {
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
    let viewModel = {
        onFocus: function(e, $el) {
            // do something...
        }
    }
```
`data-jq-focus` binding is an event handler binding for 'focus' event. The handler will receive ` event object ` and the `DOM element(not jQuery object)`.
### hover binding

### submit binding
### Filter
### One way binding
### communicate between components
### Server side rendering
## What dataBind is not...
## What's next?
----
## LICENSE
[MIT](https://gogocat.github.io/dataBind/LICENSE.txt).
