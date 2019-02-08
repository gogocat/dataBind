## What is dataBind?

dataBind is a light weight JavaScript MV* framework aim for modernise how [web sites that use jQuery](https://trends.builtwith.com/javascript/jQuery).

* **Declarative:** dataBind simpliy bind view data to the HTML, wire events, and provides two way or one way data binding
* **High performance:** dataBind is very fast. Please do try the famous [**dbmonster** example](https://gogocat.github.io/dataBind/examples/dbmonsterForOf.html), locate in `examples/dbmonsterForOf.html` and [**fiber**](https://gogocat.github.io/dataBind/examples/fiber-demo.html) `/examples/fiber-demo.html` compare with [other frameworks](http://mathieuancelin.github.io/js-repaint-perfs/)
* **DOM is the source of truth:** There is no vitrual DOM or complex reactive observables to worry about
* **Isolated scope:** Each component only works with its own viewModel scope. No complex props pass up and down
* **zero setup:** There is no need to run any build tool for development or production
* **framework agnostic :** dataBind can work with any other framework. There is no need to rebuild everything in order to use it. It is design to leverage and modernise what is already work in a web site

## How to use it?
The following is a very simple example shows text binding. 

Most of the component logic will be in the viewModel(plan old JavaScript object).

`dataBind.init` will return an instance of `Binder`(this is the bond dataBind object).
Then just call `render` to start render to the page.

**HTML**
		
    <section data-jq-comp="simpleComponent">
        <div>
            <h5 data-jq-text="heading"></h5>
            <p data-jq-text="description"></p>
        </div>
    </section>

**Js**
    
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
            console.log(filterComponent);
        });
    });

To make change, just update the viewModel data then call `render()`.
		
    simpleComponentViewModel.heading='new heading';
    
    simpleComponent.render();

`render` is an asynchronous, debounced function. So it will consolidate to render only once.

#### All declarative bindings accept value or function that returns value from the viewModel. ####

Example: `data-jq-text="heading"` reference to property **heading** in viewModel can be a value or function that returns value.

When use as function, it will get calls with some useful parameters.

The binding can also declear with parameters. 
 
    <h5 data-jq-text="heading($data)"></h5>
      
The following parameters are helpers reference `$index` or `$data` or `$root`. More details below


For more advance example. Please check the `examples/bootstrap.html`. 

> *Note, bootstrap example shows how to use multiple, nested components and services together. Please run this example from a local server*.

----

## Visual bindings
The following bindings produce visual changes

### Template binding
		
    <section data-jq-comp="simpleComponent" data-jq-tmp="{id: 'exampleTemplate', data: '$root'}">
    </section>
    
    <template id="exampleTemplate">
        <h1 data-jq-text="heading"></h1>
    </template>

The attribute `data-jq-tmp` accept a JSON like object. `id` is reference to the `template` element id. `data` is reference to the data object within the bound viewModel. In this example `$root` means the root of the viewModel itself.
If there is a 3rd option as `append: true` or `prepend: true`, the content will be append or preprend to the target container (the section tag in this example).

dataBind also support Underscore/Lodash template intepolation.
    
    <script type="html/text" id="exampleTemplate">
        <h1 data-jq-text="heading"></h1>
        {{description}}
    </script>

> *Note, support for Underscore/Lodah template will likely to be drop in the future release.*

### Text binding

    <h1 data-jq-text="heading"></h1>
    
    <h1 data-jq-text="fullName | uppercase"></h1>

The attribute `data-jq-text` is refernce to the viewModel's property '**heading**'. All binding can handle deep path reference eg. `data-jq-text="childObj.myArray[1].heading"`

The 2nd example shows usage of **filter** (more detail below). The value from viewModel's property `fullName` will pass on to the viewModel's property uppercase (a function that returns value) then display.
    
### css binding

    <h1 data-jq-css="mycCss"></h1>

The attribute `data-jq-css` is refernce to the viewModel's property '**mycCss**'. This property can be a string of css class name, an object represend mutilple css class toggle eg. `{css1: true, css2: false}` or a function that returns either string or the object.

### if binding

    <h1 data-jq-if="myCondition">
        <span>Hello</span>
    </h1>
    
    <div data-jq-if="!myCondition" data-jq-tmp="{id: 'someTemplateId', data: 'someData'}"></div>

The attribute `data-jq-if` is refernce to the viewModel's property '**myCondition**'. This property can be a boolean, or a function that returns boolean.

If `myCondition` is false. the children elements will be removed. When later `myCondition` is set to true. The elements will be render back.

With negate expression(second example above), when the expression `!myCondition` evaluate to true. The template binding `data-jq-tmp` will execute and render accordingly.

[example](https://gogocat.github.io/dataBind/examples/ifBinding.html)

### show binding

    <h1 data-jq-show="isShow">
        <span>Hello</span>
    </h1>

The attribute `data-jq-show` is refernce to the viewModel's property '**isShow**'. This property can be a boolean, or a function that returns boolean. If `isShow` is `true` the element will be display, otherwise it will be hidden. It also can handle negate expression eg `!isShow`. 

### model binding

    <input id="userName" name="userName" type="text" 
        data-jq-model="personalDetails.userName"
        data-jq-change="onInputChange" 
    required>

The attribute `data-jq-model` is refernce to the viewModel's property '**personalDetails.userName**'. This property can be a string, or a function that returns string. Model binding is one-way binding that populate the input field `value` attribute with value from the corresponing viewModel property.

**data-jq-model**
> viewModel -> DOM

For two-way data binding, use together with `data-jq-change`. It will update the viewModel if the value is different and then trigger the event handler `onInputChange`. More detail below.

**data-jq-change**
> DOM -> viewModel

[example](https://gogocat.github.io/dataBind/examples/todomvc.html)

### attribute binding

    <img data-jq-attr="getImgAttr">
    
    // js
    var viewModel = {
    	getImgAttr: function(oldAttrObj, $el) {
                return {
                    src: '/someImage.png',
                    alt: 'some image',
                };
            }
        }
    };

The attribute `data-jq-attr` is refernce to the viewModel's property '**getImgAttr**'. This property can be a object or a function that returns object with key:value. The key is the attribute name and value is the value of that attribute.

attribute binding is useful for more complex usage together with for-of binding.
Please see the `<select>` elements in this [example](https://gogocat.github.io/dataBind/examples/forOfBindingComplex.html)

### forOf binding


    <p data-jq-for="result of results" data-jq-text="result.content"></p>
    
    // js
    var viewModel = {
        results: [
            {content: '1'},
            {content: '2'},
            {content: '3'}
        ]
    };

The attribute `data-jq-for` is refernce to the viewModel's property '**results**'. `forOf` binding will then loop throught the data and repeat the element. The express accept for-in `result in results`.

The result will looks like this:

    <!--data-forOf_result_of_results-->
        <p data-jq-text="result.content">1</p>
        <p data-jq-text="result.content">2</p>
        <p data-jq-text="result.content">3</p>
    <!--data-forOf_forOf_result_of_results_end-->
    
[example](https://gogocat.github.io/dataBind/examples/forOfBinding.html)

### switch binding

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
    var viewModel = {
    	selectedStory: 's1'
    };

switch binding is a specail binding that must parent of element with `data-jq-case` or `data-jq-default` binding. Each `data-jq-case` must be siblings.

The attribute `data-jq-switch` is refernce to the viewModel's property '**selectedStory**'. This property can be a string or a function that returns a string. 

In this example the resule will looks like this because `selectedStory` match `data-jq-case="s1"`.

    <div data-jq-switch="selectedStory">
        <div data-jq-case="s1">
            <h2>Case 1</h2>
        </div>
    </div>
    
[example](https://gogocat.github.io/dataBind/examples/switchBinding.html)

## Event bindings
The following binding produce inter-activities

### change binding
### click binding
### dblclick binding
### blur binding
### focus binding
### hover binding
### submit binding

## Server side rendering
	
### What dataBind is not...

## What's next?

