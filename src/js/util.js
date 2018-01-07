// A utility file for shared functionalities

var rp = require("request-promise-native");
var _ = require("lodash");

module.exports = {
     /*
     * A utility function to search a word.
     * Currently we use shanbay API.
     * See {https://api.shanbay.com/bdc/search/?word=hello}
     * 
     * @param {String} word The word to search.
     * @return {Promise} Resolves to data, rejects to error.
     * 
     * 
     * Data model that UI layer can expect.
     * {Object}     data The found word data
     * {String}     data.content The searched word itself
     *  
     * {Object}     data.pronunciations
     * {String}     data.pronunciations.uk
     * {String}     data.pronunciations.us
     *  
     * {Object}     data.explanations
     * {String}     data.explanations.cn
     * {Object}     data.explanations.en
     * {String}     data.explanations.en.key A PoS
     * {String[]}   data.explanations.en.val An array of explanations for this PoS.
     * 
     * 
     * Error object
     * {Object} error The error object
     * {Number} error.status_code The status code
     * {String} error.msg The error msg
     */
    searchWordP: function(word) {
        console.log("in searchWordP, word=", word);
        let options = {
            url: "https://api.shanbay.com/bdc/search/",
            qs: {
                word: word
            },
            json: true
        };

        console.log("Request options: ", options);

        return rp(options)
        .then(function(res) {
            if (res.hasOwnProperty("status_code") &&
                res.status_code === 0) {
                
                let data = {};
                _.set(data, "content",
                      _.get(res, "data.content"));
                
                _.set(data, "pronunciations.uk",
                      _.get(res, "data.pronunciations.uk"));

                _.set(data, "pronunciations.us",
                      _.get(res, "data.pronunciations.us"));

                _.set(data, "explanations.cn",
                      _.get(res, "data.cn_definition"));
                
                _.set(data, "explanations.en",
                      _.get(res, "data.en_definitions"));

                return data;

            } else {
                let error = {};
                _.set(error, "status_code",
                    _.get(res, "status_code", "unknown status code"));

                _.set(error, "msg",
                    _.get(res, "msg", "unknown msg"));

                throw error;
            }
        });
    },
    /*
     * A function to return a Promise for loading vue script.
     * @return {Promise}
     */
    loadVueP: function() {
        let dev_path = "../js/vue.dev.js";
        let prd_path = "../js/vue.min.js";
        let path = process.env.NODE_ENV === "development" ? dev_path : prd_path;
    
        let el = document.createElement("script");
        el.src = path;
        document.body.appendChild(el);
        return new Promise(function(res, rej) {
            el.onload = res;
        });
    },
    user: {
        tokenValid: function() {
            return localStorage.access_token !== undefined && !this.tokenExpired();
        },
        tokenExpired: function() {
            var expired_at = localStorage.expired_at;
            return expired_at === undefined || new Date(expired_at) < new Date();
        },
        clearToken: function() {
            delete localStorage.access_token;
            delete localStorage.expired_at;
        },
        getToken: function() {
            return localStorage.access_token;
        },
        setToken: function(access_token, expired_at) {
            window.localStorage.access_token = access_token;
            window.localStorage.expired_at = tokenExpired;
        }
    }
};