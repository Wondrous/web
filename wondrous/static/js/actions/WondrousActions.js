var WondrousAPI = require("../utils/WondrousAPI");

var WondrousActions = Reflux.createActions({
    // SECTION loading from server
    // register
    "register": {},

    "registerCheck": {},

    // get current user
    "auth": {},

    // login
    "login": {},

    // logout
    "logout": {},

    // repost
    "repost": {},

    // submits new post
    "addNewPost": {},

    "newPostLoad": {},

    // submits new profile pic
    "addProfilePicture": {},

    // deletes the post
    "deletePost": {},

    "deleteComment": {},

    "addNewComment": {},

    "setNotificationSeen":{},

    // uploadFile
    "uploadFile": {},

    // loads notification from server
    "loadNotifications": {},

    // loads wall post from server
    "loadWall": {},

    "loadWallError": {},

    // load comments
    "loadComments": {},

    "loadCommentsError": {},

    // load the feed
    "loadFeed": {},

    "loadFeedError": {},

    // load a certain post
    "loadPost": {},

    // load profile from server
    "loadProfile": {},

    // load followers from server
    "loadFollower": {},

    // load following from server
    "loadFollowing": {},

    // search respectively
    "searchForUsers": {},

    "searchForPosts": {},

    // SECTION UI/UX consideration
    // might have problem logging in
    "loginError": {},

    //upload stuff
    "uploadComplete": {},

    "uploadProgress": {},

    // toggles settings side bar
    "toggleSettings": {},

    // toggles the notifications side bar
    "toggleNotifications": {},

    // toggles the picture upload form
    "togglePictureModal": {},

    // toggles the post upload form
    "togglePostModal": {},

    // adding new info to feed
    "addToFeed": {},

    // adding new info to wall
    "addToWall": {},

    "addToComments": {},

    // update initially to feed
    "updateFeed": {},

    // removes the post from wall
    "removeFromWall": {},

    // removes from feed
    "removeFromFeed": {},

    "removeFromComment": {},

    // update current user info
    "updateUser": {},

    "unloadUser": {},

    "notLoggedIn": {},

    // update initially to notification
    "updateNotification": {},

    // update initial to profile
    "updateProfile": {},

    // profile not found
    "profileError": {},

    // update initial followers
    "updateFollowers": {},

    // update initial following
    "updateFollowing": {},

    // update initial wall posts
    "updateWall": {},

    // update initial post comments
    "updateComments": {},

    "commentError": {},

    // upload error
    "uploadError": {},

    // upload complete
    "uploadComplete": {},

    // search stuff
    "updateSearchUsers": {},

    "updateSearchPosts": {},

    "newSearch":{},

    "searchError": {},

    "openCardModal": {},

    "closeCardModal": {},

    // loads the post onto modal
    "updatePost": {},

    "newProfile": {},

    "wallLoaded": {},

    "feedLoaded": {}

});

WondrousActions.registerCheck.listen(function(name, username, email, password) {
    WondrousAPI.registerCheck({
        name: name,
        username: username,
        email: email,
        password: password,
        callback: function(err,res){
            if (err==null){
                WondrousActions.loginError(null);
            }else{
                WondrousActions.loginError(err);
            }
        }
    });
});

WondrousActions.register.listen(function(name, username, email, password) {
    console.log("register request");

    WondrousAPI.register({
        name: name,
        email: email,
        username: username,
        password: password,
        callback: function(err, res){
            if (err == null){
                WondrousActions.updateUser(res);
            }else{
                WondrousActions.loginError(err);
            }
        }
    });
});

WondrousActions.login.listen(function(user_identification,password){
    console.log("login request");

    WondrousAPI.login({
        user_identification: user_identification,
        password: password,
        callback: function(err, res){
            if (err == null){
                WondrousActions.updateUser(res);
            }else{
                WondrousActions.loginError(err);
            }
        }
    });
});

WondrousActions.loadNotifications.listen(function(page){
    console.log("loading note");
    WondrousAPI.getNotifications({
        page:page,
        callback: function(err,res){
            if (err == null){
                WondrousActions.updateNotification(res);
            }else{
                console.error(err);
            }
        }
    });
});

WondrousActions.loadWall.listen(function(username,page){
    console.log('loading wall for:',username);
    WondrousAPI.getWallPosts({
        username:username,
        page: page,
        callback: function(err,res){
            if (err == null){
                WondrousActions.updateWall(res);
            }else{
                WondrousActions.loadWallError(err);
            }
        }
    });
});

WondrousActions.loadFeed.listen(function(page){
    console.log("loading feed");
    WondrousAPI.getMajorityFeed({
        page: page,
        callback: function(err,res){
            if (err == null){
                WondrousActions.updateFeed(res);
            }else{
                console.error(err);
            }
        }
    });
});

WondrousActions.auth.listen(function(){
    console.log("loading auth");

    WondrousAPI.auth({
        callback: function(err,res){
            if (err == null){
                WondrousActions.updateUser(res);
            }else{
                WondrousActions.notLoggedIn(res);
            }
        }
    });
});

WondrousActions.logout.listen(function(){
    WondrousAPI.logout({
        callback: function(err,res){
            if (err == null){
                WondrousActions.unloadUser();
            }else{
                console.error(err);
            }
        }
    });
});

WondrousActions.loadProfile.listen(function(username){
    console.log("loading profile:",username);
    WondrousAPI.getUserInfo({
        username:username,
        callback: function(err,res){
            if (err == null){
                WondrousActions.updateProfile(res);
            }else{
                WondrousActions.profileError(err);
            }
        }
    });
});

WondrousActions.loadFollower.listen(function(username,page){
    WondrousAPI.getFollowers({
        username:username,
        page:page,
        callback: function(err,res){
            if (err == null){
                WondrousActions.updateFollowers(res);
            }else{
                WondrousActions.profileError(err);
            }
        }
    });
});

WondrousActions.loadFollowing.listen(function(username,page){
    WondrousAPI.getFollowing({
        username:username,
        page:page,
        callback: function(err,res){
            if (err == null){
                WondrousActions.updateFollowing(res);
            }else{
                WondrousActions.profileError(err);
            }
        }
    });
});

WondrousActions.uploadFile.listen(function(blob,post_data,file_type){
    WondrousAPI.uploadFile({
        blob:blob,
        post_data:post_data,
        file_type:file_type,
        callback:function(err,res){
            if (err==null){
                if (post_data.hasOwnProperty('object_id')){
                    setTimeout(WondrousActions.addToFeed,200,post_data);
                    setTimeout(WondrousActions.addToWall,200,post_data);
                }else if(post_data.hasOwnProperty('is_private')){
                    WondrousActions.updateUser(post_data);
                }
                WondrousActions.uploadComplete();
            }else{
                WondrousActions.uploadError(err);
            }
        },
        onProgress:WondrousActions.uploadProgress
    });
});

WondrousActions.addNewPost.listen(function(subject,text,tags,file_to_upload,blob){
    var uploadData = {
        subject: subject,
        text: text,
        tags: tags
    };

    if (file_to_upload){
        uploadData.file_type = file_to_upload.type
    }

    WondrousAPI.newPost({
        uploadData:uploadData,
        callback: function(err,res){
            if (err == null){
                if(file_to_upload!=null){
                    WondrousActions.uploadFile(blob,res,file_to_upload.type);
                }else if(res.hasOwnProperty('object_id')){
                    WondrousActions.uploadComplete();
                    setTimeout(WondrousActions.addToFeed,200,res);
                    setTimeout(WondrousActions.addToWall,200,res);

                }
            }else{
                WondrousActions.uploadError(err);
            }
        }
    });
});

WondrousActions.addProfilePicture.listen(function(file_to_upload,blob){
    console.log("new pic",file_to_upload);
    WondrousAPI.changePicture({
        file_type:file_to_upload.type,
        callback: function(err,res){
            if (err == null){
                WondrousActions.uploadFile(blob,res,file_to_upload.type);
            }else{
                WondrousActions.uploadError(err);
            }
        }
    });
});

WondrousActions.repost.listen(function(post_id){
    WondrousAPI.repost({
        post_id:post_id,
        callback: function(err,res){
            if (err == null){
                WondrousActions.addToFeed(res);
                WondrousActions.addToWall(res);
            }else{
                WondrousActions.uploadError(err);
            }
        }
    });
});


WondrousActions.deletePost.listen(function(post_id){
    WondrousAPI.deletePost({
        post_id:post_id,
        callback: function(err,res){
            if (err == null){
                WondrousActions.removeFromWall(post_id);
                WondrousActions.removeFromFeed(post_id);
            }else{
                // WondrousActions.uploadError(err);
            }
        }
    });
});

WondrousActions.loadPost.listen(function(post_id){
    WondrousAPI.getPost({
        post_id:post_id,
        callback: function(err,res){
            if (err == null){
                WondrousActions.updatePost(res);
            }else{
                // WondrousActions.uploadError(err);
            }
        }
    });
});

WondrousActions.deleteComment.listen(function(comment_id){
    WondrousAPI.deleteComment({
        comment_id:comment_id,
        callback: function(err,res){
            if (err == null){
                WondrousActions.removeFromComment(comment_id);
            }else{
                WondrousActions.commentError(err);
            }
        }
    });
});

WondrousActions.searchForUsers.listen(function(search,page){
    WondrousAPI.searchForUsers({
        search:search,
        page:page,
        callback: function(err,res){
            if (err == null){
                WondrousActions.updateSearchUsers(res);
            }else{
                WondrousActions.searchError(err);
            }
        }
    });
});

WondrousActions.searchForPosts.listen(function(search,page){
    WondrousAPI.searchForPosts({
        search:search,
        page:page,
        callback: function(err,res){
            if (err == null){
                WondrousActions.updateSearchPosts(res);
            }else{
                WondrousActions.searchError(err);
            }
        }
    });
});

WondrousActions.loadComments.listen(function(post_id,page){
    WondrousAPI.getPostComments({
        page: page,
        post_id: post_id,
        callback: function(err,res){
            if(err==null){
                WondrousActions.updateComments(res);
            }else{
                WondrousActions.loadCommentsError(err);
            }
        }
    });
});

WondrousActions.addNewComment.listen(function(post_id,text){
    WondrousAPI.commentOnPost({
        post_id: post_id,
        text: text,
        callback: function(err,res){
            if(err==null){
                WondrousActions.addToComments(res);
            }else{
                WondrousActions.commentError(err);
            }
        }
    });
});

WondrousActions.setNotificationSeen.listen(function(){

    WondrousAPI.setNotificationSeen({
        callback: function(err,res){
            if(err==null){
                console.log("all is seen",res);
            }else{
                console.error("set all seen error",err);
            }
        }
    })
});

module.exports = WondrousActions
