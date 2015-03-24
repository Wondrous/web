var WondrousActions = require('../actions/WondrousActions');
var request = require('superagent');

function _callback(cb){
    if (!cb){
        return function(err,res){};
    }

    return function(err,res){
        // console.log("res",res);
        if (res) {
            if (typeof res.body !== 'undefined' && res.body && res.body.hasOwnProperty('error')) {
                err = res.body;
            }
        }

        if (err!=null) {
            if (cb) cb(err, null);
        } else {
            if (cb) cb(err, res.body);
        }
    }
}

VoteAction = {
    LIKED: 0,
    BOOKMARKED: 1,
    CANCEL: 2,
    FOLLOW: 3,
    ACCEPT: 4,
    BLOCK: 5,
    DENY: 6,
    TOPFRIEND: 7
};

function count(obj) {

    if (obj.__count__ !== undefined) { // Old FF
        return obj.__count__;
    }

    if (Object.keys) { // ES5
        return Object.keys(obj).length;
    }

    // Everything else:

    var c = 0, p;
    for (p in obj) {
        if (obj.hasOwnProperty(p)) {
            c += 1;
        }
    }

    return c;

}

var _send_xhr_data = function(ctr,url,blob,onProgress,onComplete,file_type){
    var xhr = new XMLHttpRequest();

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
        if (xhr.status !== 200) {
            console.error("upload incomplete!");
        }else{
            onComplete(true);
        }
        };
        xhr.onerror = function() {
            console.log("errror!!!! CORS");
        };
        xhr.upload.onprogress = function(e) {
          if (e.lengthComputable) {
            var progress = Math.round((e.loaded / e.total) * 100);
            if (onProgress) onProgress(ctr,progress);
          }
        };
      }
      xhr.setRequestHeader('Content-Type', file_type);
      xhr.setRequestHeader('x-amz-acl', 'public-read');
      xhr.send(blob);
}

module.exports = {

    // get the user admin authentication
    // options are:
    // callback
    admin_auth: function(options){
        var callback = options.callback;
        var url = '/api/admin/auth';

        request.get(url).end(_callback(callback));
    },

    // get the user discovery
    // options are:
    // callback
    // description
    loadSuggestedUsers: function(options){
        var callback = options.callback;
        var page = options.page;
        var url = '/api/users';

        request.get(url).query({
            page:page
        }).end(_callback(callback));
    },

    // get the list of liked
    // options are:
    // callback
    // page
    loadTrending: function(options){
        var callback = options.callback;
        var page = options.page;
        var url = '/api/trending';

        request.get(url).query({
            page:page
        }).end(_callback(callback));
    },

    // get the list of liked
    // options are:
    // callback
    // description
    changeDescription: function(options){
        var callback = options.callback;
        var description = options.description;
        var url = '/api/me/description';

        request.post(url).send({
            description:description
        }).end(_callback(callback));
    },

    // get the list of liked
    // options are:
    // callback
    // post_id
    // page
    getLikedUsers: function(options){
        var callback = options.callback;
        var post_id = options.post_id;
        var page = options.page;
        var url = '/api/post/likes';

        request.get(url).query({
            page:page,
            post_id:post_id
        }).end(_callback(callback));
    },

    // report a comment
    // options are:
    // callback
    // comment_id
    // reason
    // text
    reportComment: function(options){
        var callback = options.callback;
        var comment_id = options.comment_id;
        var reason = options.reason;
        var text = options.text;
        var url = '/api/report/comment';

        request.post(url).send({
            comment_id:comment_id,
            reason:reason,
            text:text
        }).end(_callback(callback));
    },

    // report a post
    // options are:
    // callback
    // comment_id
    // reason
    // text
    reportPost: function(options){
        var callback = options.callback;
        var post_id = options.post_id;
        var reason = options.reason;
        var text = options.text;
        var url = '/api/report/post';

        request.post(url).send({
            post_id:post_id,
            reason:reason,
            text:text
        }).end(_callback(callback));
    },

    // toggle privacy
    // options are:
    // callback
    toggleVisibility: function(options) {
        var callback = options.callback;
        var url = '/api/user/visibility';

        request.post(url).end(_callback(callback));
    },

    // accepts the request from the user
    // options are:
    // user_id
    // callback
    acceptRequest: function(options) {
        var callback = options.callback;
        data = {
            subject_id: options.user_id,
            action: VoteAction.ACCEPT,
            vote_type: 1
        }

        var url = '/api/user/vote';
        request.post(url).send(data).end(_callback(callback));
    },

    // toggle follow/unfollow
    // options are:
    // user_id
    // callback
    toggleFollow: function(options) {
        var callback = options.callback;
        data = {
            subject_id: options.user_id,
            action: VoteAction.FOLLOW,
            vote_type: 1
        }

        var url = '/api/user/vote';
        request.post(url).send(data).end(_callback(callback));
    },

    // toggle like/object on objects
    // options are:
    // post_id
    // callback
    toggleLike: function(options) {
        var callback = options.callback;
        data = {
            subject_id: options.post_id,
            action: VoteAction.LIKED,
            vote_type: 0
        }

        var url = '/api/post/vote';
        request.post(url).send(data).end(_callback(callback));
    },

    // Load Notifications for this profile
    // options are
    // page: 0
    // callback
    getNotifications: function(options) {
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
    getWallPosts: function(options) {
        var username = options.username;
        var page = options.page;
        var callback = options.callback;

        if(typeof(options.page)==='undefined') page = 0;

        var url = '/api/wall?username='+username+'&page='+String(page);
        // Make the get request
        request.get(url).end(_callback(callback));
    },

    // Load comments for a given post
    // options are:
    //
    getPostComments: function(options) {
        var page = options.page;
        var post_id = options.post_id;
        var callback = options.callback;

        if(typeof(options.page)==='undefined') page = 0;

        var url = '/api/post/comment?post_id='+String(post_id)+'&page='+String(page);
        // Make the get request
        request.get(url).end(_callback(callback));
    },

    // comment on post
    // options are
    // post_id
    // text
    // callback
    commentOnPost: function(options){
        var text = options.text;
        var post_id = options.post_id || null;
        var comment_id = options.comment_id || null;
        var callback = options.callback;

        var url = '/api/comment/new';
        request.post(url).send({text:text,post_id:post_id, comment_id:comment_id}).end(_callback(callback));
    },


    // Load wall posts for majority feed
    // options are:
    // page, default = 0
    // callback(err,json_res)
    getMajorityFeed: function(options) {
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
    auth: function(options){
        var callback = options.callback;
        var url = '/api/me';

        // Make the get request
        request.get(url).end(_callback(callback));
    },

    // checks registration fields user account
    // options are:
    // name
    // email
    // username
    // password
    // callback(err,json_res)
    registerCheck: function(options){
        var callback = options.callback;
        var username = options.username;
        var name = options.name;
        var email = options.email;
        var password = options.password;
        var url ="/api/user/signupcheck";

        request.post(url)
        .send({ name: name })
        .send({ username: username })
        .send({ email: email })
        .send({ password: password })
        .end(_callback(callback))
    },

    // logs the current user out!
    // callback
    logout: function(options){
        var url = '/api/auth/logout';
        var callback = options.callback;
        request.post(url).end(_callback(callback));
    },

    // request password reset
    // options are:
    // email
    // callback(err,json_res)
    requestPasswordReset: function(options){
        var callback = options.callback;
        var email = options.email;
        var url = '/api/me/reset/request'
        request.post(url).send({email:email}).end(_callback(callback));
    },

    // verify user accounts
    // options are:
    // verification_code
    // callback(err,json_res)
    verifyUser: function(options){
        var verification_code = options.verification_code;
        var callback = options.callback;
        var url = '/api/me/verify';
        request.post(url).send({verification_code:verification_code}).end(_callback(callback));
    },

    // request for verifying user accounts
    // options are:
    // email
    // callback(err,json_res)
    requestVerification: function(options){
        var email = options.email;
        var callback = options.callback;
        var url = '/api/me/verify/request';
        request.post(url).send({email:email}).end(_callback(callback));
    },

    // sends a password reset request along with a verification_code
    // options are:
    // verification_code
    // password
    // callback(err,json_res)
    passwordReset: function(options){
        var verification_code = options.verification_code;
        var password = options.password;
        var callback = options.callback;
        var url = '/api/me/reset';
        request.post(url).send({verification_code:verification_code, password:password}).end(_callback(callback));
    },

    // checks registration fields user account
    // options are:
    // name
    // email
    // username
    // password
    // callback(err,json_res)
    register: function(options){
        var callback = options.callback;
        var username = options.username;
        var name = options.name;
        var email = options.email;
        var password = options.password;
        var code = options.code;

        var url ='/api/auth/register';

        request.post(url)
        .send({ name: name })
        .send({ username: username })
        .send({ email: email })
        .send({ password: password })
        .send({ code: code })
        .end(_callback(callback))
    },

    // logs the user in fields user account
    // options are:
    // user_identification
    // password
    // callback(err,json_res)
    login: function(options){
        var callback = options.callback;
        var user_identification = options.user_identification;
        var password = options.password;
        var url ='/api/auth/login';

        request.post(url)
        .send({ user_identification: user_identification })
        .send({ password: password })
        .end(_callback(callback))
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

    // repost post
    // options is:
    // callback(err,json_res)
    // repost_id

    repost: function(options){
        var post_id = options.post_id;
        var callback = options.callback;

        var url = '/api/wall/repost';
        request.post(url)
        .send({post_id:post_id}).end(_callback(callback));
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

    // Change profile picture
    // options is:
    // callback(err,json_res)
    // old_password
    // new_password
    changePassword: function(options){
        var old_password = options.old_password;
        var new_password = options.new_password;
        var callback = options.callback;

        var url = '/api/me/password'
        request.post(url)
        .send({old_password:old_password, new_password:new_password})
        .end(_callback(callback));
    },

    // Deactivate your accound
    // options is:
    // callback(err,json_res)
    // password
    deactivateAccount: function(options){
        var password = options.password;
        var callback = options.callback;

        var url = '/api/me/deactivate'
        request.post(url)
        .send({password:password})
        .end(_callback(callback));
    },

    // Change username
    // options is:
    // callback(err,json_res)
    // new_value
    changeUsername: function(options){
        var username = options.username;
        var callback = options.callback;

        var url = '/api/me/username'
        request.post(url)
        .send({username:username})
        .end(_callback(callback));
    },

    // Change name
    // options is:
    // callback(err,json_res)
    // name, name
    changeName: function(options){
        var name = options.name;

        var callback = options.callback;

        var url = '/api/me/name'
        request.post(url)
        .send({name:name})
        .end(_callback(callback));
    },

    // Requests the server to delete the post
    // options is:
    // callback(err,json_res)
    // uploadData: object comprised of the the follow:
    //      post_id
    //      callback
    deletePost: function(options) {
        var post_id = options.post_id,
            callback=options.callback,
            url = '/api/post/delete';

        request.del(url)
        .send({post_id: post_id})
        .end(_callback(callback));
    },

    // Requests the server to get the post
    // options is:
    // callback(err,json_res)
    // uploadData: object comprised of the the follow:
    //      post_id
    //      callback
    getPost: function(options) {
        var post_id = options.post_id,
            callback=options.callback,
            url = '/api/post';

        request.get(url)
        .query({post_id: post_id})
        .end(_callback(callback));
    },

    // Request to delete the comment
    // options are:
    //  comment_id
    //  callback
    deleteComment: function(options){
        var comment_id = options.comment_id;
        var callback = options.callback;

        var url = '/api/comment/delete';
        request.del(url)
        .send({comment_id: comment_id})
        .end(_callback(callback));
    },

    // Register/retrieve referrer by email
    // options is:
    // callback(err,json_res)
    // email
    // ref_uuid
    registerReferrer: function(options) {
        var email = options.email,
            ref_uuid=options.ref_uuid,
            callback=options.callback,
            url = '/api/refer';

        if (typeof ref_uuid === 'undefined'){
            ref_uuid = null;
        }

        request.post(url)
        .send({email:email, ref_uuid:ref_uuid})
        .end(_callback(callback));
    },

    // retrieves referrer info by uuid
    // options is:
    // callback(err,json_res)
    // uuid
    getReferrerProgress: function(options) {
        var email = options.email,
            uuid=options.uuid,
            callback=options.callback,
            url = '/api/refer/progress?uuid='+uuid;

        if (typeof uuid === 'undefined'){
            return;
        }

        request.get(url).end(_callback(callback));
    },

    //search user
    // callback
    // search term
    // page
    searchForUsers: function(options){
        var url = "/api/search/user";
        var search = encodeURIComponent(options.search);
        var page = options.page;
        var callback = options.callback;
        request.get(url).query({search:search,page:page}).end(_callback(callback));
    },

    //search post
    // callback
    // search term
    // page
    searchForPosts: function(options){
        var url = "/api/search/post";
        var search = encodeURIComponent(options.search);
        var page = options.page;
        var callback = options.callback;
        request.get(url).query({search:search,page:page}).end(_callback(callback));
    },

    //search posts by tags
    // callback
    // search term
    // page
    searchForTags: function(options){
        var url = "/api/search/tags";
        var search = encodeURIComponent(options.search);
        var page = options.page;
        var callback = options.callback;
        request.get(url).query({search: search, page: page}).end(_callback(callback));
    },

    //search posts by tags
    // callback
    // search term
    // page
    searchForUserTags: function(options){
        var url = "/api/search/users";
        var search = encodeURIComponent(options.search);
        var page = options.page;
        var callback = options.callback;
        request.get(url).query({search: search, page: page}).end(_callback(callback));
    },

    setNotificationSeen:function(options){
        var url = '/api/notification/seen';
        var callback = options.callback;
        request.post(url).end(_callback(callback));
    },



    // Upload file to s3
    // options:
    // callback(err,json_res)
    // blob
    // file_type
    // post_data // the returned json object data from newPost
    // onProgress(int) //optional
    uploadFile: function(options){
        if(!options.hasOwnProperty('blobs')||!options.hasOwnProperty('post_data')||!options.hasOwnProperty('file_type')){
            if (callback) callback({error:"not enough"},null);
        }

        var callback = options.callback;
        var post_data = options.post_data;
        var blobs = options.blobs;
        var onProgress = options.onProgress;
        var file_type = options.file_type;

        var signed_urls = post_data.signed_requests;

        var file_count = count(signed_urls);

        var percentages = [];

        for(var i = 0; i < file_count; i++) {
            percentages.push(0)
        }

        var onAggregateProgress = function(i,percentage){
            percentages[i]=percentage;
            var sum = percentages.reduce(function(a,b){
                return a+b;
            }, 0);
            onProgress(sum/file_count);
        }

        var files_uploaded = 0;
        var onComplete = function(val){
            files_uploaded++;
            if (files_uploaded==file_count){
                if(callback) callback(null,{"result":"uploaded"});
            }
        }

        if (post_data.hasOwnProperty('signed_requests')){
            var ctr = 0;
            for (var name in signed_urls){
                var signed_url = signed_urls[name]
                var blob = null;

                if(name.indexOf('150x150')>-1){
                    blob = blobs['150x150']
                }else if(name.indexOf('75x75')>-1){
                    blob = blobs['75x75']
                }else if (name.indexOf('45x45')>-1){
                    blob = blobs['45x45']
                }else if (name.indexOf('-med')>-1){
                    blob = blobs['medium']
                }else {
                    blob = blobs['fullsize']
                }
                _send_xhr_data(ctr,signed_url,blob,onAggregateProgress,onComplete,file_type);
                ctr++;
            }
        }else{
            if (callback) callback(null,{error:"no signed_requests"});
        }
    }
}
