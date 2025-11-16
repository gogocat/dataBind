(() => {
    const viewModel = {
        appName: 'Todos',
        tasks: [],
        displayTasks: [],
        displayFilter: 'all',
        hasTask: false,
        hasCompletedTask: false,
        remainingCount: 0,
        remainingCountLabel: ' task',
        taskCss: {},
        showAllCss: {selected: true},
        showActiveCss: {selected: false},
        showCompletedCss: {selected: false},
        onAddTask(e, $el, newValue) {
            this.tasks.push({
                taskTitle: String(newValue).trim(),
                completed: false,
                editing: false,
            });
            // force filter all mode
            this.displayFilter = 'all';
            this.updateViewData();
            $el.value = '';
        },
        onMarkAllCompleted(e, $el, newValue) {
            this.tasks.forEach((task) => {
                task.completed = newValue;
            });
            this.updateViewData();
        },
        onClearAllCompleted() {
            const newTasks = this.tasks.filter((task) => {
                return task.completed !== true;
            });
            this.tasks = newTasks;
            this.updateViewData();
        },
        onTaskCompleted(e, $el, newValue, oldValue, index) {
            this.tasks[index].completed = newValue;
            this.updateViewData({templateBinding: true});
        },
        onTaskRemove(e, $el, index) {
            this.tasks.splice(index, 1);
            this.updateViewData();
        },
        onEditTask(e, $el, index) {
            this.tasks[index].editing = true;
            this.updateViewData({templateBinding: false});
        },
        onBlurEditTask(e, $el, index) {
            const oldValue = this.tasks[index].taskTitle;
            const newValue = $el.value.trim();
            let isChanged = false;

            if (oldValue !== newValue) {
                this.tasks[index].taskTitle = newValue;
                isChanged = true;
            }
            this.tasks[index].editing = false;
            this.updateViewData({templateBinding: isChanged});
        },
        onShowAllTasks() {
            this.displayFilter = 'all';
            this.updateViewData();
        },
        onShowAactiveTasks() {
            this.displayFilter = 'active';
            this.updateViewData();
        },
        onShowCompletedTasks() {
            this.displayFilter = 'completed';
            this.updateViewData();
        },
        getCompletedTasks() {
            return this.tasks.filter((task) => {
                return task.completed === true;
            });
        },
        getDisplayTasks() {
            let displayTasks = [];
            switch (this.displayFilter) {
                case 'all':
                    displayTasks = this.tasks;
                    this.showAllCss = {selected: true};
                    this.showActiveCss = {selected: false};
                    this.showCompletedCss = {selected: false};
                    break;
                case 'active':
                    displayTasks = this.tasks.filter((task) => {
                        return task.completed !== true;
                    });
                    this.showAllCss = {selected: false};
                    this.showActiveCss = {selected: true};
                    this.showCompletedCss = {selected: false};
                    break;
                case 'completed':
                    displayTasks = displayTasks = this.tasks.filter((task) => {
                        return task.completed === true;
                    });
                    this.showAllCss = {selected: false};
                    this.showActiveCss = {selected: false};
                    this.showCompletedCss = {selected: true};
                    break;
            }
            return displayTasks;
        },
        setTaskLabelAttr(index) {
            return {for: `taskEdit-${index}`};
        },
        setTaskInputAttr(index) {
            return {id: `taskEdit-${index}`};
        },
        updateViewData(renderOption) {
            const compltedTasks = this.getCompletedTasks();
            const compltedTasksLength = compltedTasks.length;
            const currentTaskLength = this.tasks.length;

            renderOption = renderOption || {templateBinding: true};
            this.hasTask = currentTaskLength > 0;
            this.hasCompletedTask = compltedTasksLength > 0;
            this.remainingCount = currentTaskLength - compltedTasksLength;
            this.remainingCountLabel = this.remainingCount > 1 ? ' tasks' : ' task';
            this.displayTasks = this.getDisplayTasks();
            todoApp.render(renderOption);
            // update db
            db.set('todos', this.tasks);
        },
        afterTemplateRender() {
            console.log('template rendered');
        },
    };

    const db = {
        set(storeKey, data) {
            if (storeKey && data) {
                localStorage.setItem(storeKey, JSON.stringify(data));
            }
        },
        get(storeKey) {
            return JSON.parse(localStorage.getItem(storeKey));
        },
        clear(storeKey) {
            if (storeKey) {
                localStorage.removeItem(storeKey);
            }
        },
    };

    viewModel.displayTasks = db.get('todos') || [];

    const todoApp = dataBind.init(document.getElementById('todoapp'), viewModel);
    todoApp.render().then(() => {
        // retrive data from storage
        viewModel.tasks = db.get('todos') || [];
        // update viewModel data and trigger todoApp.render
        if (viewModel.tasks.length) {
            viewModel.updateViewData();
        }
        // for debug
        window.todoApp = todoApp;
    });
})();
