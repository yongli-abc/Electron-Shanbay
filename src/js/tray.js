import { loadVueP } from "./util";

console.log("in the tray");
console.log("node_env=", process.env.NODE_ENV);

const path = require("path");
const util = require(path.join(__dirname), "../js/util.js");
const _ = require("lodash");


// fixing electron issue
window.$ = window.jQuery = require('../js/jquery-3.2.1.min.js');
window.Hammer = require('../js/hammer.min.js');

let app = null;
util.loadVueP()
.then(function() {
    app = new Vue({
        el: "#app",
        data: {
    
        },
        methods: {
            /*
             * Enter key pressed on input field.
             */
            onEnter: function() {
                console.log("Enter key pressed on input field");
            }
        }
    })
})

