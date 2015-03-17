var WondrousActions = require('../actions/WondrousActions');

var SettingStore = Reflux.createStore({
    listenables: WondrousActions,

    init:function(){

    }

});


module.exports = SettingStore;
