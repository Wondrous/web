var WondrousActions = require('../actions/WondrousActions');
var WondrousAPI = require('../utils/WondrousAPI');
var UserStore = require('../stores/UserStore');
var Link = Router.Link;

var UserTitle = React.createClass({
    repost: null,
    mixins: [Router.Navigation],

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
                    <div className="post-subject-text nh">
                        <div className="post-subject-wrapper">
                            <div className="post-subject-text-position">
                                <span className="post-micro-data-super-analytics-item">
                                    <img src="/static/pictures/icons/view/eye_gray_shadow.svg" className="post-general-icon" style={{height: 22, width: 22, top: 7, marginRight: 2}} />
                                    {this.props.data.view_count}
                                </span>

                                <span className="post-micro-data-super-analytics-item">                                
                                    <img src={this.props.data.liked ? "/static/pictures/icons/like/heart_red.svg" : "/static/pictures/icons/like/heart_gray_shadow.svg"} className="post-general-icon" style={{height: 18, width: 18, top: 5, marginRight: 2}} />
                                    {this.props.data.like_count}
                                </span>
                            </div>
                        </div>
                    </div>
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
            WondrousActions.loadPost(this.props.data.id);
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
        if (typeof this.props.data === 'undefined'){
            return (<div></div>);
        }
        var repost = null;
        var is_it_mine = this.props.data.username === UserStore.user.username;

        if (this.props.data.hasOwnProperty('repost')) {
            repost = this.props.data.repost;
            this.props.data.text = repost.text;
            this.props.data.subject = repost.subject;
        }


        var thisText = '';
        if (typeof this.props.data.text!=='undefined'){
            thisText =this.props.data.text.split('\n');
        }

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
