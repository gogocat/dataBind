(function($, window) {
    let todoApp;
    let db;
    let viewModel = {
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
        onAddTask: function(e, $el, newValue, oldValue) {
            this.tasks.push({
                taskTitle: String(newValue).trim(),
                completed: false,
                editing: false,
            });
            // force filter all mode
            this.displayFilter = 'all';
            this.updateViewData();
            $el.val('');
        },
        onMarkAllCompleted: function(e, $el, newValue, oldValue) {
            this.tasks.forEach(function(task, index) {
                task.completed = newValue;
            });
            this.updateViewData();
        },
        onClearAllCompleted: function(e, $el) {
            let newTasks = this.tasks.filter(function(task, index) {
                return task.completed !== true;
            });
            this.tasks = newTasks;
            this.updateViewData();
        },
        onTaskCompleted: function(e, $el, newValue, oldValue, index) {
            this.tasks[index].completed = newValue;
            this.updateViewData({templateBinding: true});
        },
        onTaskRemove: function(e, $el, index) {
            this.tasks.splice(index, 1);
            this.updateViewData();
        },
        onEditTask: function(e, $el, index) {
            this.tasks[index].editing = true;
            this.updateViewData({templateBinding: false});
        },
        onBlurEditTask: function(e, $el, index) {
            let oldValue = this.tasks[index].taskTitle;
            let newValue = _.escape($el.val().trim());
            let isChanged = false;

            if (oldValue !== newValue) {
                this.tasks[index].taskTitle = newValue;
                isChanged = true;
            }
            this.tasks[index].editing = false;
            this.updateViewData({templateBinding: isChanged});
        },
        onShowAllTasks: function(e) {
            this.displayFilter = 'all';
            this.updateViewData();
        },
        onShowAactiveTasks: function(e) {
            this.displayFilter = 'active';
            this.updateViewData();
        },
        onShowCompletedTasks: function(e) {
            this.displayFilter = 'completed';
            this.updateViewData();
        },
        getCompletedTasks: function() {
            return this.tasks.filter(function(task, index) {
                return task.completed === true;
            });
        },
        getDisplayTasks: function() {
            let displayTasks = [];
            switch (this.displayFilter) {
            case 'all':
                displayTasks = this.tasks;
                this.showAllCss = {selected: true};
                this.showActiveCss = {selected: false};
                this.showCompletedCss = {selected: false};
                break;
            case 'active':
                displayTasks = this.tasks.filter(function(task, index) {
                    return task.completed !== true;
                });
                this.showAllCss = {selected: false};
                this.showActiveCss = {selected: true};
                this.showCompletedCss = {selected: false};
                break;
            case 'completed':
                displayTasks = displayTasks = this.tasks.filter(function(task, index) {
                    return task.completed === true;
                });
                this.showAllCss = {selected: false};
                this.showActiveCss = {selected: false};
                this.showCompletedCss = {selected: true};
                break;
            }
            return displayTasks;
        },
        setTaskLabelAttr: function(index) {
            return {for: `taskEdit-${index}`};
        },
        setTaskInputAttr: function(index) {
            return {id: `taskEdit-${index}`};
        },
        updateViewData: function(renderOption) {
            let compltedTasks = this.getCompletedTasks();
            let compltedTasksLength = compltedTasks.length;
            let currentTaskLength = this.tasks.length;

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
        afterTemplateRender: function() {
            console.log('template rendered');
        },
    };

    db = {
        set: function(storeKey, data) {
            if (storeKey && data) {
                localStorage.setItem(storeKey, JSON.stringify(data));
            }
        },
        get: function(storeKey) {
            return JSON.parse(localStorage.getItem(storeKey));
        },
        clear: function(storeKey) {
            if (storeKey) {
                localStorage.removeItem(storeKey);
            }
        },
    };

    viewModel.displayTasks = db.get('todos') || [];

    $(document).ready(function() {
        todoApp = dataBind.init($('#todoapp'), viewModel);
        todoApp.render().then(function() {
            // retrive data from storage
            viewModel.tasks = db.get('todos') || [];
            // update viewModel data and trigger todoApp.render
            if (viewModel.tasks.length) {
                viewModel.updateViewData();
            }
            // for debug
            window.todoApp = todoApp;
        });
    });
})(jQuery, window);
