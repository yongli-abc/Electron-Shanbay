console.log("inside index.js");
console.log("node_env=", process.env.NODE_ENV);

const path = require("path");
const util = require(path.join(__dirname, "../js/util.js"));

// fixing electron issue
window.$ = window.jQuery = require('../js/jquery-3.2.1.min.js');
window.Hammer = require('../js/hammer.min.js');

const k_view = Object.freeze({
    init: "initView",
    word: "wordView",
    load: "loadView",
    error: "errorView"
});

let app = null; // global reference to the vue app,
                // so we can access it from devTool

util.loadVueP()
.then(function() {
    let scrollHeight = parseFloat($("#app").css("height")) -
                       parseFloat($("#search-bar").css("height")) -
                       parseFloat($("#index-banner").css("height"));
    scrollHeight = Math.ceil(scrollHeight);
    $("#scroll-view").css("height", scrollHeight + "px");

    app = new Vue({
        el: "#app",
        data: {
            searchWord: null,
            view: k_view.init,
            word: null,
            error: null
        },
        methods: {
            onFocus: function() {
                $("#search-word").removeClass("valid")
                                 .removeClass("invalid");
            },
            /*
             * The search button is clicked.
             * Initiate the search.
             */
            onSearch: function() {
                console.log("Search button clicked.");
                $("#search-word").blur();
                
                let that = this;
                Promise.resolve()
                .then(function() {
                    that.view = k_view.load;
                    return util.searchWordP(that.searchWord);
                })
                .then(function(data) {
                    console.log("onSearch got data=", data);
                    that.word = data;

                    // tweaking
                    if (data.pronunciations.uk && data.pronunciations.uk !== "") {
                        that.word.pronunciations.uk = "🇬🇧 /" + data.pronunciations.uk + "/";
                    }
                    if (data.pronunciations.us && data.pronunciations.us !== "") {
                        that.word.pronunciations.us = "🇺🇸 /" + data.pronunciations.us + "/";
                    }

                    $("#search-word").addClass("valid");
                    that.view = k_view.word;
                })
                .catch(function(error) {
                    console.log("onSearch caught error=", error);
                    that.error = error;
                    $("#search-word").addClass("invalid");
                    that.view = k_view.error;
                });
            },
            /*
             * 
             */
            onEnter: function() {
                document.getElementById("search-btn").click();
            }
        }
    });
});