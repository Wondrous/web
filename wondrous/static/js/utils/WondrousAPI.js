var WondrousActions = require('../actions/WondrousActions');
var request = require('superagent');

function _callback(cb){
    return function(err,res){
        console.log("res",res);
        if(res){
            if(typeof res.body !== 'undefined' && res.body && res.body.hasOwnProperty('error')){
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

VoteAction = {
    LIKED:0,
    BOOKMARKED:1,
    CANCEL:2,
    FOLLOW:3,
    ACCEPT:4,
    BLOCK:5,
    DENY:6,
    TOPFRIEND:7
};

module.exports = {
    // toggle privacy
    // options are:
    // callback
    toggleVisibility: function(options){
        var callback = options.callback;
        var url = '/api/user/visibility';

        request.post(url).end(_callback(callback));
    },

    // accepts the request from the user
    // options are:
    // user_id
    // callback
    acceptRequest: function(options){
        var callback = options.callback;
        data = {
            user_id:options.user_id,
            action:VoteAction.ACCEPT,
            vote_type:1
        }

        var url = '/api/user/vote';
        request.post(url).send(data).end(_callback(callback));
    },

    // toggle follow/unfollow
    // options are:
    // user_id
    // callback
    toggleFollow: function(options){
        var callback = options.callback;
        data = {
            user_id:options.user_id,
            action:VoteAction.FOLLOW,
            vote_type:1
        }

        var url = '/api/user/vote';
        request.post(url).send(data).end(_callback(callback));
    },

    // Load Notifications for this profile
    // options are
    // page: 0
    // callback
    getNotifications: function(options){
        var callback = options.callback;
        var page = options.page;
        if(typeof(options.page)==='undefined') page = 0;

        var url = '/api/notification?page='+String(page);

        //Make the get request
        request.get(url).end(_callback(callback));
    },

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
    },

    // Load their user info
    // options are:
    // username
    // page = 0
    // callback(err,json_res)
    getFollowers: function(options){
        var callback = options.callback;
        var username = options.username;
        var page = options.page;
        var url = '/api/user/followers?username='+username+'&page='+String(page);

        // Make the get request
        request.get(url).end(_callback(callback));
    },

    // Load their user info
    // options are:
    // username
    // page = 0
    // callback(err,json_res)
    getFollowing: function(options){
        var callback = options.callback;
        var username = options.username;
        var page = options.page;
        var url = '/api/user/following?username='+username+'&page='+String(page);

        // Make the get request
        request.get(url).end(_callback(callback));
    },

    // Post new post
    // options is:
    // callback(err,json_res)
    // uploadData: object comprised of the the follow:
    //      subject
    //      text
    //      tags -- optional
    //      file_type -- optional
    newPost: function(options){
        var uploadData = options.uploadData;
        var callback = options.callback;
        if (!uploadData.hasOwnProperty('subject')||!uploadData.hasOwnProperty('text')) callback({error:"not sufficient"},null);

        var url = '/api/wall/new';
        request.post(url)
        .send(uploadData).end(_callback(callback));
    },

    // Change profile picture
    // options is:
    // callback(err,json_res)
    // uploadData: object comprised of the the follow:
    //      file_type
    //      callback
    changePicture: function(options){
        var file_type = options.file_type;
        var callback = options.callback;

        var url = '/api/me/picture';
        request.post(url)
        .send({file_type:file_type}).end(_callback(callback));
    },

    // Upload file to s3
    // options:
    // callback(err,json_res)
    // blob
    // file_type
    // post_data // the returned json object data from newPost
    // onProgress(int) //optional
    uploadFile: function(options){
        if(!options.hasOwnProperty('blob')||!options.hasOwnProperty('post_data')||!options.hasOwnProperty('file_type')){
            if (callback) callback({error:"not enough"},null);
        }

        var callback = options.callback;
        var post_data = options.post_data;
        var blob = options.blob;
        var onProgress = options.onProgress;
        var file_type = options.file_type;

        if (post_data.hasOwnProperty('signed_request')){
            var xhr = new XMLHttpRequest();
            var url = post_data['signed_request'];

            if (xhr.withCredentials !== null) {
                xhr.open('PUT', url, true);
            } else if (typeof XDomainRequest !== "undefined") {
                xhr = new XDomainRequest();
                xhr.open('PUT', url);
            } else {
                xhr = null;
            }

            if (!xhr) {
                this.onError('CORS not supported');
            } else {
                xhr.onload = function() {
                if (xhr.status === 200) {
                    if(callback) callback(null,xhr);
                } else {
                    console.error("upload incomplete!");
                }
                };
                xhr.onerror = function() {
                    console.log("errror!!!! CORS");
                };
                xhr.upload.onprogress = function(e) {
                  if (e.lengthComputable) {
                    var progress = Math.round((e.loaded / e.total) * 100);
                    if (onProgress) onProgress(progress);
                  }
                };
              }
              xhr.setRequestHeader('Content-Type', file_type);
              xhr.setRequestHeader('x-amz-acl', 'public-read');
              xhr.send(blob);
        }else{
            if (callback) callback(null,{error:"no signed_request"});
        }
    }
}
