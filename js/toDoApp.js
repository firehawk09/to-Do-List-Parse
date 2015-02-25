;(function(exports) {

    "use strict";

    Parse.TodoRouter = Parse.Router.extend({
        initialize: function(){

            this.collection = new Parse.TodoList();
            this.view = new Parse.TodoView({
                collection: this.collection
            });
            // this.authView = new Parse.AuthView({});
            this.collection.fetch();

            Parse.history.start();
        },
        routes: {
            // "login": "login",
            "*default": "home"
        },
        // amILoggedIn: function(){

        // },
        // login: function(){

        // },
        home: function() {
            this.view.render();
        }
    })

    Parse.TodoView = Parse.TemplateView.extend({
        el: ".container1",
        view: "todoList",
        events: {
            "submit .addItemForm": "addItem",
            "change input[name='urgent']": "urgentIsChecked",
            "change input[name='isDone']": "doneIsChecked",
            "keyup .description": "setDescription"
        },
        addItem: function(event) {
            event.preventDefault();
            var data = {
                title: this.el.querySelector("input").value,
                user: Parse.user.current()
            }
            this.collection.create(data, {
                validate: true
            });
        },
        getModelAssociatedWithEvent: function(event){ // Borrowed from Matt. Thanks Matt :)
            var el = event.target,
                li = $(el).closest('li')[0],
                id = li.getAttribute('id'),
                m = this.collection.get(id);

            return m;
        },
        urgentIsChecked: function(e) {
            var m = this.getModelAssociatedWithEvent(e);
            if(m){
                m.set('urgent', !m.get('urgent'));
                this.collection.sort();
                this.render();
            };
        },
        doneIsChecked: function(e){
            var m = this.getModelAssociatedWithEvent(e);
            if(m){
                m.set('done', !m.get('done'));
                this.collection.sort();
                this.render();
            };
        },
        setDescription: function(e){
            var m = this.getModelAssociatedWithEvent(e);
            if(m){
                m.set('description', e.target.innertext);
                m.save();
            }
        }
    })

    Parse.AuthView = Parse.TemplateView.extend({
        el: ".container1",
        view: "Auth",
        events: {
            "submit .login": "login",
            "submit .register": "register"
        },
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

    Parse.TodoList = Parse.Collection.extend({
        model: Parse.TodoModel

    //     querySelector = new Parse.Query(ParseTodo);
    //     todos.query = query;
    //     todos.fetch();
    })

})(typeof module === "object" ? module.exports : window)
