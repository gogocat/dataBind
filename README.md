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
Note, this example shows how to use multiple, nested components and services together. You will need to run this html in a local server.

## 

### What not

Markdown is a lightweight and easy-to-use syntax for styling your writing. It includes conventions for

```markdown
Syntax highlighted code block

# Header 1
## Header 2
### Header 3

- Bulleted
- List

1. Numbered
2. List

**Bold** and _Italic_ and `Code` text

[Link](url) and ![Image](src)
```

For more details see [GitHub Flavored Markdown](https://guides.github.com/features/mastering-markdown/).

### Jekyll Themes

Your Pages site will use the layout and styles from the Jekyll theme you have selected in your [repository settings](https://github.com/gogocat/dataBind/settings). The name of this theme is saved in the Jekyll `_config.yml` configuration file.

### Support or Contact

Having trouble with Pages? Check out our [documentation](https://help.github.com/categories/github-pages-basics/) or [contact support](https://github.com/contact) and we’ll help you sort it out.
