var WondrousActions = require('../actions/WondrousActions');
var UserStore = require('../stores/UserStore');
var WondrousAPI = require('../utils/WondrousAPI');
var URLGenerator = require('../utils/URLGenerator');

var PostFormStore = Reflux.createStore({
    listenables: WondrousActions,

    init:function(){
        this.unloadUser();
    },

    unloadUser: function(){
        this.percent = 0;
    },

    uploadComplete: function(status){
        this.percent = 0;
        this.trigger({completed:status,percent:this.percent,error:null});
    },

    uploadProgress: function(percent){
        this.percent = percent;
        this.trigger({completed:false,percent:percent,error:null});
    },

    uploadError: function(error){
        this.trigger({percent:this.percent,completed:false,error:error});
    }

});

module.exports = PostFormStore;
