var WondrousActions = require('../actions/WondrousActions');
var request = require('superagent');

function _callback(cb){
    return function(err,res){
        console.log("res",res);
        if(res){
            if(res.body.hasOwnProperty('error')){
                err = res.body;
            }
        }

        if(err!=null){
            if(cb) cb(err,null);
        }else{
            if(cb) cb(err,res.body);
        }
    }
}

module.exports = {

    // Load wall posts for profile username or id
    // options are:
    // username
    // page, default = 0
    // callback(err,json_res)
    getWallPosts: function(options){
        var username = options.username;
        var page = options.page;
        var callback = options.callback;

        if(typeof(options.page)==='undefined') page = 0;

        var url = '/api/wall?username='+username+'&page='+String(page);
        // Make the get request
        request.get(url).end(_callback(callback));
    },

    // Load wall posts for majority feed
    // options are:
    // page, default = 0
    // callback(err,json_res)
    getMajorityPosts: function(options){
        var page = options.page;
        var callback = options.callback;

        if(typeof(options.page)==='undefined') page = 0;

        var url = '/api/feed?feed_type=0&page='+String(page);
        // Make the get request
        request.get(url).end(_callback(callback));
    },

    // Load my user info, different level of info
    // options are:
    // callback(err,json_res)
    getMyInfo: function(options){
        var callback = options.callback;
        var url = '/api/me';

        // Make the get request
        request.get(url).end(_callback(callback));
    },

    // Load their user info
    // options are:
    // username
    // callback(err,json_res)
    getUserInfo: function(options){
        var callback = options.callback;
        var username = options.username;
        var url = '/api/user?username='+username;

        // Make the get request
        request.get(url).end(_callback(callback));
    }
}
