
var WondrousActions = require('../actions/WondrousActions');
var WondrousAPI = require('../utils/WondrousAPI');

var LoginStore = Reflux.createStore({
    listenables: WondrousActions,

    loginError: function(error){
        this.trigger(error);
    }
});


module.exports = LoginStore;
