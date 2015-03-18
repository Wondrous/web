var MasonryMixin = require('../../vendor/masonry.mixin');
var WallStore = require('../../stores/WallStore');
var WondrousActions = require('../../actions/WondrousActions');
var ProfileStore = require('../../stores/ProfileStore');
var UserStore = require('../../stores/UserStore');
var Post = require('../Post/Post.react');

var masonryOptions = {
    transitionDuration: 0,
    itemSelector: ".masonry-brick",
    columnWidth: ".grid-sizer"
};

var Wall = React.createClass({
    mixins: [MasonryMixin('masonryContainer', masonryOptions), Router.State, Reflux.connect(WallStore,"data")],
    componentDidMount: function(){
        WondrousActions.wallLoaded();
    },
    getInitialState: function() {
        return {data:WallStore.getWall()};
    },

    showNewPost: function(e) {
        WondrousActions.togglePostModal();
    },

    render: function() {
        var am_following = ProfileStore.user.following;
        var is_private = ProfileStore.user.is_private;
        var is_visible = am_following || is_private;
        is_visible = is_visible==true;
        // console.log("rendering post",this.state.data);
        var posts = this.state.data.map(function(post,index){
            return(
                <Post key={post.id} data={post} />
            );
        });
        var username = this.getParams().username;
        var is_me = username === UserStore.user.username;
        return (
            <div>
                {is_me ? <div onClick={this.showNewPost} id="new-post-launch" className="round-2">Make a new post</div> : null}
                <div className="masonry" ref="masonryContainer" id="asyncPosts">
                <div className="grid-sizer" style={{  display: "none" }}></div>
                    {posts}
                </div>
                <div>
                {!WallStore.donePaging&&posts.length>0?<img className="loading-wheel" src="/static/pictures/p.loading.gif"/>:null}
                </div>
            </div>
        );
    }
});


module.exports = Wall;