// A utility file for shared functionalities

var rp = require("request-promise-native");
var _ = require("lodash");

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
function searchWordP(word) {
    let options = {
        url: "https://api.shanbay.com/bdc/search/",
        qs: {
            word: this.searchWord
        },
        json: true
    };

    console.log("Request options: ", options);

    rp(options)
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
}