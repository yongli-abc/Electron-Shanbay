console.log("inside index.js");
console.log("node_env=", process.env.NODE_ENV);

var rp = require("request-promise-native");
var _ = require("lodash");

// load vue.js according to environment
const vuePath = process.env.NODE_ENV === "development" ?
                "../js/vue.dev.js" :
                "../js/vue.min.js";

const vueScript = document.createElement("script");
vueScript.src = vuePath;
document.body.appendChild(vueScript);

const k_view = Object.freeze({
    init: "initView",
    word: "wordView",
    load: "loadView",
    error: "errorView"
})

let app = null; // global reference to the vue app,
                // so we can access it from devTool

new Promise(function(res, rej) {
    vueScript.onload = res;
})
.then(function() {
    console.log("loaded:" + vuePath);

    app = new Vue({
        el: "#app",
        data: {
            searchWord: "查询",
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
            errorMsg: null
        },
        methods: {
            /*
             * The search button is clicked.
             * Initiate the search.
             */
            search: function() {
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
                        this.errorMsg = {
                            status_code: _.get(res, "status_code", "unknown status code"),
                            msg: _.get(res, "msg", "unknown msg")
                        };
                        this.view = k_view.error;
                    }
                    
                }.bind(this))
                .catch(function(err) {
                    console.log("ERROR: failed to send request for searching word, ", err);
                })
            }
        }
    });


});