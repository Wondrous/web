var keyMirror = require('react/lib/keyMirror');

// Key Mirror creates an object with key==value
// present tense please
// See more: https://www.npmjs.com/package/keymirror
module.exports = keyMirror({
    POST_LIKE: null,            // like a post
    POST_BOOKMARK: null,        // bookmark a post
    POST_DELETE: null,          // delete a post
    POST_REPORT: null,          // report a post
    POST_NEW: null,             // post a new post
    FEED_LOAD: null,            // loading for feed
    WALL_LOAD: null,            // loading for wall
    USER_LOAD: null,            // User login
    USER_UNLOAD: null,          // User unload
    PROFILE_LOAD: null,         // Profile Load
    SHOW_SETTINGS: null,        // SideBar Settings
    SHOW_NOTIFICATIONS: null,   // Show sidebar notifications
    NEW_POST: null,             // New Post
    POST_COMPLETED: null,       // New Post uploaded completely
    FOLLOWER_LOAD: null,        // Follower just loaded
    FOLLOWING_LOAD: null,       // Following just loaded
    NOTIFICATION_LOAD: null,    // Notifications just loaded
    NOTIFICATION_RECEIVE: null, // A new notification just loaded
    SHOW_PICTURE_CHANGE: null,  // Showing new profile picture upload
    SHOW_NEW_POST: null,        // Showing new post upload
    NEW_PROFILE_PICTURE: null,  // new profile picture
    POST_DELETED: null          // a post is deleted -- alert feed + wall 

});
