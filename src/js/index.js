console.log("inside index.js");
console.log("node_env=", process.env.NODE_ENV);

var rp = require("request-promise-native");
var _ = require("lodash");

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

// Load different scripts
// !! Order is important: jquery goes before materialize
let k_paths = {
    prod: {
        vue: "../js/vue.min.js",
        // jquery: "../js/jquery-3.2.1.min.js",
        // materialize: "../js/materialize.min.js"
    },
    dev: {
        vue: "../js/vue.dev.js",
        // jquery: "../js/jquery-3.2.1.js",
        // materialize: "../js/materialize.js"
    }
};
k_paths = process.env.NODE_ENV === "development" ? k_paths.dev : k_paths.prod;

/*
 * Get a promise for loading the script file.
 * @param {String} path The path to the script file.
 * @return {Promise} The promise object.
 */
function getLoadingP(path) {
    let el = document.createElement("script");
    el.src = path;
    document.body.appendChild(el);
    return new Promise(function(res, rej) {
        el.onload = res;
    });
}

const loadVueP = getLoadingP(k_paths.vue);
// This part somehow doesnt' work.
// const loadJqueryP = getLoadingP(k_paths.jquery);
// const loadMaterializeP = loadJqueryP.then(function() {
//     return getLoadingP(k_paths.materialize);
// });

Promise.all([loadVueP])
.then(function() {
    app = new Vue({
        el: "#app",
        data: {
            searchWord: null,
            view: k_view.init,
            word: {
                content: null,
                pronunciations: {
                    uk: null,
                    us: null,
                },
                explanations: {
                    /*
                     * @param {Object} cn The definition object for Chinese explanation.
                     * @param {String} cn.pos The PoS for Chinese explanation.
                     * @param {String} cn.defn The explanation string.
                     */
                    cn: null,

                    /*
                     * @param {Object} en An object of English definition
                     * @param {String} en.key Part of Speech
                     * @param {String[]} en.val An array of explanations for this PoS
                     */
                    en: null,
                }
            },
            error: null
        },
        methods: {
            /*
             * The search button is clicked.
             * Initiate the search.
             */
            onSearch: function() {
                console.log("Search button clicked.");

                let options = {
                    url: "https://api.shanbay.com/bdc/search/",
                    qs: {
                        word: this.searchWord
                    },
                    json: true
                };

                console.log("Request options: ", options);

                this.view = k_view.load; // temporarily switch to loading view
                rp(options)
                .then(function(res) {
                    console.log("Request response: ", res);

                    // handling response data
                    if (res.hasOwnProperty("status_code") &&
                        res.status_code === 0) {
                        this.word.content = _.get(res, "data.content");
                        this.word.pronunciations.uk =  _.get(res, "data.pronunciations.uk");
                        this.word.pronunciations.us = _.get(res, "data.pronunciations.us");
                        this.word.explanations.cn = _.get(res, "data.cn_definition");
                        this.word.explanations.en = _.get(res, "data.en_definitions");

                        // tweaking
                        if (this.word.pronunciations.uk && this.word.pronunciations.uk !== "") {
                            this.word.pronunciations.uk = "/" + this.word.pronunciations.uk + "/";
                        }
                        if (this.word.pronunciations.us && this.word.pronunciations.us !== "") {
                            this.word.pronunciations.us = "/" + this.word.pronunciations.us + "/";
                        }
                        
                        this.view = k_view.word;
                    } else {
                        this.error = {
                            status_code: _.get(res, "status_code", "unknown status code"),
                            msg: _.get(res, "msg", "unknown msg")
                        };
                        this.view = k_view.error;
                    }
                    
                }.bind(this))
                .catch(function(err) {
                    console.log("ERROR: failed to send request for searching word, ", err);
                })
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