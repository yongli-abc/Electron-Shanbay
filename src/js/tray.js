console.log("in the tray");
console.log("node_env=", process.env.NODE_ENV);

const path = require("path");
const util = require(path.join(__dirname, "../js/util.js"));
const _ = require("lodash");
const {remote} = require("electron");

// fixing electron issue
window.$ = window.jQuery = require('../js/jquery-3.2.1.min.js');
window.Hammer = require('../js/hammer.min.js');

let win = remote.getCurrentWindow();

function updateWinSize() {
    let bounds = win.getBounds();
    bounds.height = $("body").height() + 5;
    win.setBounds(bounds, true);
}

let app = null;
util.loadVueP()
.then(function() {
    app = new Vue({
        el: "#app",
        data: {
            searchWord: null,
            word: null,
            error: null,
            load: false
        },
        methods: {
            /*
             * Enter key pressed on input field.
             */
            onSearch: function() {
                console.log("Enter key pressed on input field");

                let that = this;
                Promise.resolve()
                .then(function() {
                    that.word = null;
                    that.error = null;
                    that.load = true;
                })
                .then(function() {
                    updateWinSize();
                })
                .then(function() {
                    return util.searchWordP(that.searchWord);
                })
                .then(function(data) {
                    console.log("onSearch got data=", data);
                    that.word = data;
                    that.error = null;
                    that.load = false;

                    $("#search-input").addClass("valid");
                })
                .catch(function(error) {
                    console.log("onEnter caught error=", error);
                    that.error = error;
                    that.word = null;
                    that.load = false;

                    $("#search-input").addClass("invalid");
                })
                .then(function() {
                    updateWinSize();
                });
            },
            /*
             * 
             */
            onEsc: function() {
                win.hide();
            }
        },
        watch: {
            searchWord: function(w) {
                if (w === "") {
                    this.word = null;
                    this.error = null;
                    $("#search-input").removeClass("valid");
                    $("#search-input").removeClass("invalid");
                    Vue.nextTick(updateWinSize);
                }
            }
        }
    });
    Vue.nextTick(function() {
        $("#search-input").focus();
    })
});