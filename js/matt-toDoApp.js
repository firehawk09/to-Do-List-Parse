;(function(exports){

    "use strict";

    Parse.TodoRouter = Parse.Router.extend({
        initialize: function(){

            this.collection = new Parse.TodoList();
            this.homeView = new Parse.TodoView({
                collection: this.collection
            });
            this.authView = new Parse.AuthView({});
            this.isLoggedIn();

            Parse.history.start();
        },
        routes: {
            "login": "login",
            "*default": "home"
        },
        isLoggedIn: function(){
            this.user = Parse.User.current();
            if(!this.user){
                this.navigate("login", {trigger: true});
                return false;
            }
            return true;
        },
        login: function(){
            this.authView.render();
        },
        home: function(){
            if(!this.isLoggedIn()) return; // if user not logged in, exit this function
            var query = new Parse.Query(Parse.Task);
            query.equalTo("user", this.user);
            this.collection.query = query;
            this.collection.fetch();
            this.homeView.render();
        }
    })

    Parse.TodoView = Parse.TemplateView.extend({
        el: ".container",
        view: "app",
        events: {
            "submit .tasks": "addTask",
            "change input[name='urgent']": "toggleUrgent",
            "change input[name='isDone']": "toggleIsDone",
            "keyup .description": "setDescription"
        },
        addTask: function(e){
            e.preventDefault();
            var data = {
                description: this.el.querySelector('input').value,
                user: Parse.User.current()
            }
            var task = new Parse.Task(data);
            var acl = new Parse.ACL(Parse.User.current());
            var self = this;
            task.setACL(acl);
            task.save().then(function(){
                self.collection.fetch()
            });
        },
        getModelAssociatedWithEvent: function(e){
            var el = e.target,
                li = $(el).closest('li')[0],
                id = li.getAttribute('id'),
                m = this.collection.get(id);

            return m;
        },
        toggleUrgent: function(e){
            var m = this.getModelAssociatedWithEvent(e);
            if(m){
                m.set('urgent', !m.get('urgent'));
                this.collection.sort();
                this.render();
            }
        },
        toggleIsDone: function(e){
            var m = this.getModelAssociatedWithEvent(e);
            if(m){
                m.set('isDone', !m.get('isDone'));
                if(m.get('isDone')){ // if setting to 'done', set 'urgent' to false
                    m.set('urgent', false);
                }
                this.collection.sort();
                this.render();
            }
        },
        setDescription: function(e){
            var m = this.getModelAssociatedWithEvent(e);
            if(m){
                m.set('description', e.target.innerText);
                m.save();
            }
        }
    })

    Parse.AuthView = Parse.TemplateView.extend({
        el: ".container",
        view: "auth",
        events: {
            "submit .login": "login",
            "submit .register": "register"
        },
        login: function(e){
            e.preventDefault();
            var data =  {
                username: this.el.querySelector(".login input[name='email']").value,
                password: this.el.querySelector(".login input[name='password']").value
            }
            var result = Parse.User.logIn(data.username, data.password);
            result.then(function(){
                window.location.hash = "#home"
            })
            result.fail(function(error){
                alert(error.message);
            })
        },
        register: function(e){
            e.preventDefault();
            var data =  {
                username: this.el.querySelector(".register input[name='email']").value,
                password1: this.el.querySelector(".register input[name='password1']").value,
                password2: this.el.querySelector(".register input[name='password2']").value
            }

            if(data.password1 !== data.password2){
                alert("Passwords must match");
                return;
            }

            var user = new Parse.User();
            user.set('username', data.username)
            user.set('email', data.username)
            user.set('password', data.password1)

            var result = user.signUp()
            result.then(function(user){
                window.location.hash = "#home"
                alert("Welcome home, "+user.get("username"));
            })
            result.fail(function(error){
                alert(error.message);
            })
        }
    })

    Parse.Task = Parse.Object.extend({
        className: "Task",
        defaults: {
            isDone: false,
            urgent: false,
            dueDate: null,
            tags: [],
            description: "no description given"
        },
        initialize: function(){
            this.on("change", function(){
                this.save();
            })
        }
    })

    Parse.TodoList = Parse.Collection.extend({
        model: Parse.Task,
        comparator: function(a, b){
            // if a is 'urgent', -1 (a comes before b)
            if(a.get('urgent') && !b.get('urgent') || !a.get('isDone') && b.get('isDone')) return -1;
            // if a 'isDone', 1 (a comes after b)
            if(a.get('isDone') && !b.get('isDone') || !a.get('urgent') && b.get('urgent')) return 1;

            return a.get('description') > b.get('description') ? 1 : -1;
        }
    })

})(typeof module === "object" ? module.exports : window)