## What is dataBind?

dataBind is a light weight JavaScript MV* framework aim for modernise web sites that use [jQuery](https://trends.builtwith.com/javascript/jQuery) - over 80%.

In simple overview, dataBind simpliy bind view data to the view(HTML), events, two way or one way data binding.
Because of simplicity, dataBind is very fast. Please do try the famous dbmonster example, locate in `examples/dbmonsterForOf.html` and fiber `/examples/fiber-demo.html`. 
Compare with [other frameworks.](http://mathieuancelin.github.io/js-repaint-perfs/)

## How to use it?
This is a very simple example of text binding.

HTML view
		
    <section data-jq-comp="simpleComponent">
        <div>
            <h5 data-jq-text="heading"></h5>
            <p data-jq-text="description"></p>
        </div>
    </section>

Js
    
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

> *Note, bootstrap example shows how to use multiple, nested components and services together. You will need to run the html in a local server*.

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
### css binding
### if binding
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

