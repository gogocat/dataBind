// Manual Mode Component
(() => {
    const viewModel = {
        name: 'John Doe',
        age: 30,
        counter: 0,

        // Click handler methods
        updateData() {
            this.name = 'Jane Smith';
            this.age = 25;
            // MUST call render manually in manual mode
            this.APP.render();
        },

        incrementCounter() {
            this.counter += 1;
            // MUST call render manually in manual mode
            this.APP.render();
        },
    };

    const component = dataBind.init(
        document.querySelector('[data-bind-comp="manual-component"]'),
        viewModel,
        {reactive: false}, // Explicitly disable reactive mode for manual mode
    );

    component.render().then(() => {
        console.log('Manual component ready');
        window.manualComponent = component;
    });
})();

// Reactive Mode Component
(() => {
    const viewModel = {
        name: 'John Doe',
        age: 30,
        counter: 0,

        // Click handler methods - NO render() calls needed!
        updateData() {
            this.name = 'Jane Smith';
            this.age = 25;
            // Automatic render in reactive mode!
        },

        incrementCounter() {
            this.counter += 1;
            // Automatic render in reactive mode!
        },
    };

    const component = dataBind.init(
        document.querySelector('[data-bind-comp="reactive-component"]'),
        viewModel,
        // Reactive mode is now the default! No options needed.
    );

    component.render().then(() => {
        console.log('Reactive component ready');
        console.log('isReactive:', component.isReactive);
        window.reactiveComponent = component;
    });
})();

// Advanced Reactive Demo with Arrays
(() => {
    const viewModel = {
        todos: [
            {text: 'Learn dataBind.js', completed: false},
            {text: 'Build awesome app', completed: false},
            {text: 'Ship to production', completed: false},
        ],
        todoCounter: 4,

        // Click handler methods - all automatic!
        addTodo() {
            this.todos.push({
                text: `New todo ${this.todoCounter}`,
                completed: false,
            });
            this.todoCounter += 1;
            // Automatic render!
        },

        completeFirst() {
            if (this.todos.length > 0) {
                this.todos[0].completed = true;
                // Automatic render!
            }
        },

        removeLast() {
            this.todos.pop();
            // Automatic render!
        },

        batchUpdate() {
            // Multiple changes batched into single render automatically!
            this.todos.push({text: 'Batch todo 1', completed: false});
            this.todos.push({text: 'Batch todo 2', completed: false});
            this.todos.push({text: 'Batch todo 3', completed: false});
            // Only 1 render happens due to requestAnimationFrame debouncing!
        },
    };

    const component = dataBind.init(
        document.querySelector('[data-bind-comp="advanced-reactive"]'),
        viewModel,
        // Reactive mode is the default!
    );

    component.render().then(() => {
        console.log('Advanced reactive component ready');
        window.advancedReactiveComponent = component;
    });
})();
