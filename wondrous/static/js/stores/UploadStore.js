
var WondrousActions = require('../actions/WondrousActions');
var WondrousAPI = require('../utils/WondrousAPI');

var UploadStore = Reflux.createStore({
    listenables: WondrousActions,

    uploadComplete: function(status){
        this.trigger({completed:status});
    },
    uploadProgress: function(percent){
        console.log("uploaded",percent);
        this.trigger({percent:percent});
    },
    uploadError: function(error){
        this.trigger({error:error});
    }
});


module.exports = UploadStore;
