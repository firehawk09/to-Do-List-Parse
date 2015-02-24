;
(function(exports) {
    "use strict";

    Parse.TodoRouter = Parse.Router.extend({

        initialize: function() {
            this.collection = new Parse.TodoActualList();

            this.view1 = new Parse.TodoView({
                collection: this.collection
            });

            this.view2 = new Parse.TodoViewDetail({});

            this.collection.fetch();

            Parse.history.start();
        },
        routes: {
            "*default": "home",
            "details/:item": "showDetail"
        },
        home: function() {
            this.view1.render();
            //this.view2.render(); //Temporary: we'll move the detail view later
        }
    })

    Parse.TodoModel = Parse.Object.extend({
        className: "taskToDo",
        defaults: {
            "checked": "false",
            "title": "No title given.",
            "done": "false"
        },
        validate: function(data) {
            this.on("change", function(){
                this.save();
            })
            var x = data.title.length > 0;
            if (!x) {
                return "Title Required.";
            }
        }
    })

    Parse.TodoActualList = Parse.Collection.extend({
        model: Parse.TodoModel

    //     querySelector = new Parse.Query(ParseTodo);
    //     todos.query = query;
    //     todos.fetch();
    })

    Parse.TodoView = Parse.TemplateView.extend({
        el: ".container1",
        view: "todoList",
        events: {
            "submit .addItemForm": "addItem"
        },
        addItem: function(event) {
            event.preventDefault();
            var x = {
                title: this.el.querySelector("input[name = 'John']").value
            }
            this.collection.create(x, {
                validate: true
            });
            console.log("Yay!");
            // debugger;
        },
        checked: function() {

        }
    })

    Parse.TodoViewDetail = Parse.TemplateView.extend({
        el: ".container2",
        view: "todoDetails",
        initialize: function(options) {
            this.options = options;
            // this.listenTo(Parse, "newModelForDetailView", this.setModel)
            this.model && this.model.on("change", this.render.bind(this));
            this.collection && this.collection.on("add reset remove", this.render.bind(this));
        },
        setModel: function(model) {
            if (this.model === model) {
                this.model = null;
                this.el.innerHTML = "";
            } else {
                this.model = model;
                this.render();
            }
        }
    })

})(typeof module === "object" ? module.exports : window)
