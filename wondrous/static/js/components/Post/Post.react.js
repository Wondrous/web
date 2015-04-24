var WondrousActions = require('../../actions/WondrousActions');
var WondrousAPI = require('../../utils/WondrousAPI');
var PostStore = require('../../stores/PostStore');
var UserStore = require('../../stores/UserStore');
var checkLogin = require('../../utils/Func').checkLogin;
var Photo = require('./Photo.react');
var UserTitle = require('./UserTitle.react');

var Post = React.createClass({
    mixins: [ Reflux.connect(PostStore) ],

    contextTypes: {
        router: React.PropTypes.func
    },

    getInitialState: function(){
        return PostStore.getPostState();
    },

    handleClick: function(evt) {
        if (!evt.metaKey){
            evt.preventDefault();

            if (typeof this.props.data.id !=='undefined'){
                WondrousActions.newPostLoad(this.props.data.id);
            }

            WondrousActions.updatePost(this.props.data);
            WondrousActions.openCardModal();
        }
    },

    render: function() {
        if (typeof this.props.data === 'undefined' || typeof this.props.data.username === 'undefined') {
            return (<div></div>);
        }

        var repost = null;
        var is_it_mine = this.props.data.username === UserStore.user.username;

        if (this.props.data.hasOwnProperty('repost')) {
            repost = this.props.data.repost;
            this.props.data.text = repost.text;
            this.props.data.subject = repost.subject;
        }

        var thisTextSlice = this.props.data.text;
        if (thisTextSlice && thisTextSlice.length > 0) {
            thisTextSlice = thisTextSlice.substring(0, 70);
            if (thisTextSlice.length >= 70) thisTextSlice += "...";
            this.props.data.textPreview = thisTextSlice;
        }

        var postHeaderStyles = { position: "relative" };
        postHeaderStyles['backgroundColor'] = "rgb(255,255,255)";

        // var is_influencer = (this.props.data.wondrous_score >= 75);
        // if (!is_influencer) {
        //     postHeaderStyles['backgroundColor'] = "rgb(255,255,255)";
        // } else {
        //     postHeaderStyles['backgroundColor'] = "rgb(0,226,174)";
        // }

        return (
            <div ref="brick" className="masonry-brick">
                <div ref="post" className="post-body round-3">
                    <div style={postHeaderStyles}>
                        <UserTitle data={this.props.data} />
                    </div>

                    <a href={"/post/"+this.props.data.id} onClick={this.handleClick} id="slidePhoto">
                        <Photo ref="photo" data={this.props.data} />
                    </a>
                </div>
            </div>
            );
    }
});

module.exports = Post;
