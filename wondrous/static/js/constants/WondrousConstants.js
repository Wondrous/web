var keyMirror = require('react/lib/keyMirror');

// Key Mirror creates an object with key==value
// present tense please
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
    TOGGLE_SIDEBAR: null,       // SideBar toggle
    NEW_POST: null,             // New Post
    POST_COMPLETED: null,       // New Post uploaded completely
    FOLLOWER_LOAD: null,        // Follower just loaded 
    FOLLOWING_LOAD: null,       // Following just loaded
});
