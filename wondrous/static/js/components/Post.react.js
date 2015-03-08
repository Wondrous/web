var WondrousActions = require('../actions/WondrousActions');
var WondrousAPI = require('../utils/WondrousAPI');
var UserStore = require('../stores/UserStore');
var Link = Router.Link;

var UserTitle = React.createClass({
    repost: null,
    mixins: [Router.Navigation],

    handleClick: function() {
        if (typeof this.props.data.username != 'undefined') {
            this.transitionTo('/' + this.props.data.username);
        }
    },

    handleClickOnOwner: function(evt) {
        evt.preventDefault();
        if (typeof this.repost.username != 'undefined') {
            this.transitionTo('/' + this.repost.username);
        }
    },

    render: function() {
        if(typeof this.props.data === 'undefined'){
            return (<div></div>);
        }
        var hrefRepostPlaceholder = '';
        var name = this.props.data.name;
        if (this.props.data.hasOwnProperty('repost')) {
            this.repost = this.props.data.repost;
            hrefRepostPlaceholder = '/' + this.repost.username;
        }
        var img_src = (typeof this.props.data.user_ouuid !== 'undefined') ? "http://mojorankdev.s3.amazonaws.com/"+this.props.data.user_ouuid : "/static/pictures/defaults/p.default-profile-picture.jpg";
        var hrefPlaceholder = '/' + this.props.data.username;
        return (
            <div>
                <img ref="usericon" className="post-thumb round-50" src={img_src}/>
                <span className="post-identifier ellipsis-overflow" style={this.repost ? {top:0} : null}>
                    <Link to={hrefPlaceholder}>{name}</Link>
                    {this.repost ? <img src="/static/pictures/icons/repost/repost_gray_shadow.svg" className="post-general-icon" style={{height: 22, width: 22, top: 7}} /> : null}
                    {this.repost ? <Link className="recipient" to={hrefRepostPlaceholder}>{this.repost.name}</Link> : null}

                </span>
            </div>
            );
    }
});

// var Comment = React.createClass({
//     mixins: [Router.Navigation],
//
//
//     handleClick: function(evt) {
//         evt.preventDefault();
//         if (typeof this.props.data.username != 'undefined') {
//             this.props.dismiss();
//             this.transitionTo('/' + this.props.data.username);
//
//         }
//     },
//
//     render: function() {
//         var img_src = (typeof this.props.data.ouuid !== 'undefined') ? "http://mojorankdev.s3.amazonaws.com/"+this.props.data.ouuid : "/static/pictures/defaults/p.default-profile-picture.jpg";
//         var hrefPlaceholder = "/" + this.props.data.username;
//         return (
//             <div className="post-comment">
//                 <div className="post-comment-image-wrapper round-2">
//                     <img className="round-2" style={{"height": 25, "width": 25}} src={img_src} />
//                 </div>
//                 <div className="post-comment-content">
//                     <Link to={hrefPlaceholder} className="post-comment-un">
//                         {this.props.data.name}
//                         <span style={{"fontWeight": 100}}> (@{this.props.data.username})</span>
//                     </Link>
//                     <span>{this.props.data.text}</span>
//
//                 </div>
//             </div>
//         );
//     }
// });
//
// var Comments = React.createClass({
//     getInitialState: function(){
//         return {data:[]};
//     },
//     handleCommentPost: function(err,res){
//         if (err == null){
//             console.log("You have successfully posted a comment", res);
//             this.refs.commentBox.getDOMNode().value = ''
//             this.refs.commentBox.getDOMNode().blur();
//             this.props.data.push(res);
//             this.forceUpdate();
//         } else {
//
//         }
//     },
//     onComment: function(evt){
//         evt.preventDefault();
//         var text = this.refs.commentBox.getDOMNode().value.trim();
//         if (text.length > 0) {
//             WondrousAPI.commentOnPost({
//                 text:text,
//                 post_id: this.props.post_id,
//                 callback: this.handleCommentPost
//             });
//         } else {
//             // Send out a friendly error: "Please add some text!"
//         }
//     },
//     render: function() {
//         var comments = this.props.data.map(function(comment, index) {
//             return (
//                 <Comment key={comment.id} data={comment} dismiss={this.dismiss}/>
//             );
//         },this.props);
//
//         return (
//             <div>
//                 {comments.length > 0 ? comments : <div className="post-no-comments">Be the first to share your thoughts!</div>}
//                 <form style={{ "marginLeft": 28, "marginRight": 10 }} onSubmit={this.onComment}>
//                     <textarea className="comment-textarea" ref="commentBox" placeholder="Share your thoughts!"></textarea>
//                     <input className="post-comment-btn" type="submit" value="Share" />
//                 </form>
//             </div>);
//     }
// });


var Photo = React.createClass({

    render: function() {
        if (this.props.data.hasOwnProperty('repost')) {
            this.props.data = this.props.data.repost;
        }
        photoStyle = {
            backgroundImage: this.props.data.ouuid ? "url(http://mojorankdev.s3.amazonaws.com/" + this.props.data.ouuid+")" : "/static/pictures/500x500.gif",
        };

        return (
            <div ref="container" className="post-cover-photo cover no-top-border nh" style={photoStyle}>
                    {/*<div className="post-subject-text nh">
                        <div className="post-subject-wrapper">
                            <div className="post-subject-text-position">
                                {this.props.data.subject}
                            </div>
                        </div>
                    </div>*/}
            </div>);
    },
    componentDidMount: function() {
        // Nothing much happening here!!!
    }
});

var Post = React.createClass({

    getInitialState: function() {
        return {comments: [], commentsVisible: false};
    },

    handleClick: function(evt) {
    	// add modal functionality
        if (!evt.metaKey){
            evt.preventDefault();
            WondrousActions.newPostLoad(this.props.data.id);
            WondrousActions.updatePost(this.props.data);

            WondrousActions.openCardModal();
        }
    },

    deletePost: function () {
        this.handleClick();
        WondrousActions.deletePost(this.props.data.id);
    },

    handlePostLike: function(err, res) {
        if (err == null) {
            //console.log("liked",res);
            this.props.data.liked = res.like;
            this.forceUpdate();
        } else {

        }
    },

    likePost: function() {
        //console.log("liking post");
        WondrousAPI.toggleLike({
            post_id: this.props.data.id,
            callback: this.handlePostLike
        });
    },

    onViewComments: function(err, res) {
        if (err == null) {
            console.log("loaded comments are for", this.props.data.id, res);
            this.setState({comments: res});
        } else {
            console.error("problems with loading comments", err);
        }
    },


    clickRepost: function() {
        WondrousActions.repost(this.props.data.id) ;
        this.handleClick();
    },

    clickViewComments: function() {
        this.setState({commentsVisible: !this.state.commentsVisible});
        WondrousAPI.getPostComments({
            page: 0,
            post_id: this.props.data.id,
            callback: this.onViewComments
        });
    },

    render: function() {
        var repost = null;
        var is_it_mine = this.props.data.username === UserStore.user.username;

        if (this.props.data.hasOwnProperty('repost')) {
            repost = this.props.data.repost;
            this.props.data.text = repost.text;
            this.props.data.subject = repost.subject;
        }


        var thisText = this.props.data.text.split('\n');
        return (
            <div ref="brick" className="masonry-brick">
                <div ref="post"  className="post-body round-3">
                    <div style={{ backgroundColor: "#FFFFFF", position: "relative" }}>
                        <UserTitle data={this.props.data} />
                    </div>
                    <div className="post-title">{this.props.data.subject}</div>
                    <a href={"/post/"+this.props.data.id} onClick={this.handleClick} id="slidePhoto">
                        <Photo ref="photo" data={this.props.data}/>
                    </a>
                </div>
            </div>
            );
    }
});

module.exports = Post;
