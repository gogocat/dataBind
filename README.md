## What is dataBind?

dataBind is a light weight JavaScript MV* framework aim for modernise how [web sites that use jQuery](https://trends.builtwith.com/javascript/jQuery).

* **Declarative:** dataBind simpliy bind view data to the HTML, wire events, and provides two way or one way data binding.
* **High performance:** dataBind is very fast. Please do try the famous **dbmonster** example, locate in `examples/dbmonsterForOf.html` and **fiber** `/examples/fiber-demo.html` compare with [other frameworks.](http://mathieuancelin.github.io/js-repaint-perfs/)
* **zero setup:** There is no need to run any build tool for development.

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
If there is a 3rd option as `append: true` or `prepend: true`, the content will be append or preprend to the container (the section tag in this example).

### Text binding

    <h1 data-jq-text="heading"></h1>

The attribute `data-jq-text` is refernce to the viewModel's property 'heading'. All binding can handle deep path reference eg.
`data-jq-text="childObj.myArray[1].heading"`
    
### css binding

    <h1 data-jq-css="mycCss"></h1>

The attribute `data-jq-css` is refernce to the viewModel's property 'mycCss'. This property can be a string of css class name, an object represend mutilple css class toggle eg. `{css1: true, css2: false}` or an function that returns either string or the object.

### if binding

    <h1 data-jq-if="myCondition">
        <span>Hello</span>
    </h1>
    
    <div class="" data-jq-if="!myCondition" data-jq-tmp="{id: 'someTemplateId', data: 'someData'}"></div>

The attribute `data-jq-if` is refernce to the viewModel's property 'myCondition'. This property can be a boolean, or an function that returns boolean. It can handle negate expression as well. In the second example above. When the expression `!myCondition` evaluate true. The template binding `data-jq-tmp` will run.

### show binding
### model binding
### attribute binding
### forOf binding
### switch binding

## Event bindings
The following binding produce inter-activities

### change binding
### click binding
### dblclick binding
### blur binding
### focus binding
### hover binding
### submit binding
	
### What not

