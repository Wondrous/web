var WondrousAPI = require('../utils/WondrousAPI');
var WondrousActions = require('../actions/WondrousActions');
var UserStore = require('../stores/UserStore');


var UserTitle = React.createClass({
    repost: null,
    mixins: [Router.Navigation],
    handleProfileData: function(err, data) {
        if (err == null) {
            console.log("Profile from post", data);
            WondrousActions.loadProfileInfo(data);
        } else {
            // WondrousActions.unloadUserInfo(err);
        }
    },
    handleWallData: function(err, data) {
        if (err == null) {
            WondrousActions.loadWallPosts(data);
            console.log("Wall from post", data);
        } else {

        }
    },
    loadProfileFromServer: function(username) {
        if (typeof username ==='undefined') username=this.props.data.username;
        WondrousAPI.getUserInfo({
            username: username,
            callback: this.handleProfileData
        });
    },
    loadWallFromServer: function(username) {
        if (typeof username === 'undefined') username=this.props.data.username;
        WondrousAPI.getWallPosts({
            username: username,
            page: 0,
            callback: this.handleWallData
        });
    },
    handleClick: function() {
        if (typeof this.props.data.username != 'undefined') {
            this.transitionTo('/' + this.props.data.username);
            this.loadProfileFromServer();
            this.loadWallFromServer();
        }
    },
    handleClickOnOwner: function(){
        if (typeof this.repost.username != 'undefined') {
            this.transitionTo('/' + this.repost.username);
            this.loadProfileFromServer(this.repost.username);
            this.loadWallFromServer(this.repost.username);
        }
    },
    render: function() {
        var name = this.props.data.name;
        if (this.props.data.hasOwnProperty('repost')) {
            this.repost = this.props.data.repost;
        }
        var img_src = (typeof this.props.data.user_ouuid !== 'undefined') ? "http://mojorankdev.s3.amazonaws.com/"+this.props.data.user_ouuid : "/static/pictures/defaults/p.default-profile-picture.jpg";
        return (
            <div>
                <img ref="usericon" className="post-thumb round-50" src={img_src}/>
                <span className="post-identifier ellipsis-overflow">
                    <a onClick={this.handleClick}>{name}</a>
                    {this.repost ? " reposted from " : null}
                    {this.repost ? <a className="recipient" onClick={this.handleClickOnOwner}>{this.repost.name}</a>:null}
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

        // var img_src = this.props.data.ouuid ? "http://mojorankdev.s3.amazonaws.com/"+this.props.data.ouuid : "/static/pictures/500x500.gif";
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
    handleClick: function() {
        var SPEED = 0;
        var thisPost = $(this.refs.post.getDOMNode());
        var thisBrick = $(this.refs.brick.getDOMNode());
        var thisPostContent = thisPost.find('.post-content');
        var thisCoverPhoto = thisPost.find('.post-cover-photo');

        $('.backdrop').toggleClass('dimmer');
        thisPost.css('z-index', 9);

        $('.post-body').not(thisPost).removeClass('is-expanded');
        $('.post-content').not(thisPostContent).slideUp(SPEED);
        $('.post-cover-photo').not(thisCoverPhoto).removeClass('no-bottom-border');
        $('.post-content').not(thisPostContent).removeClass('no-top-border');
        $('.masonry-brick').not(thisBrick).removeClass('post-presentation');

        thisPost.toggleClass('is-expanded');
        thisPost.find('.pseudo-bg-img').toggleClass('pseudo-bg-img-closed').toggleClass('pseudo-bg-img-expanded');
        thisPost.find('.post-cover-photo').toggleClass('no-bottom-border');
        thisPostContent.toggleClass('no-top-border');

        thisBrick.toggleClass('post-presentation');
        thisPostContent.slideToggle(SPEED);

        // Hmmmmm.... Let's try this out
        $('html, body').animate({ scrollTop: thisBrick.offset().top-60 }, 300);

        // Trigger Masonry Layout
        // this.props.toggle();
    },
    handleData: function(err,res){
        if(err==null){
            this.handleClick();
            WondrousActions.postDelete(res.id);
        }else{

        }
    },
    deletePost: function () {
        WondrousAPI.deletePost({
            post_id:this.props.data.id,
            callback:this.handleData
        });
    },
    handlePostLike:function(err,res){
        if(err==null){
            console.log("liked",res);
            this.props.data.liked=res.like;
            this.forceUpdate();
        }else{

        }
    }
    ,
    likePost:function(){
        console.log("liking post");
        WondrousAPI.toggleLike({
            post_id:this.props.data.id,
            callback:this.handlePostLike
        });
    },
    onRepost:function(err,res){
        if (err==null){
            console.log("repost results",res);
            WondrousActions.addNewPost(res);
        }else{
            console.error("repost err",err);
        }
    },
    clickRepost:function(){
        uploadData = {
            'post_id' : this.props.data.id
        };

        console.log("reposting", uploadData);

        WondrousAPI.repost({
            uploadData:uploadData,
            callback:this.onRepost
        });
        this.handleClick();
    },
    render: function() {
        var repost = null;
        var is_it_mine = this.props.data.username === UserStore.getUserData().username;

        if (this.props.data.hasOwnProperty('repost')) {
            repost = this.props.data.repost;
            this.props.data.text = repost.text;
            this.props.data.subject = repost.subject;
        }

        var thisText = this.props.data.text.split('\n');
        return (
            <div ref="brick" className="masonry-brick">
                <div ref="post"  className="post-body round-3" >
                    <div style={{"backgroundColor": "#FFFFFF","position":"relative"}}>
                        <UserTitle data={this.props.data} />
                    </div>
                    <div className="post-title">{this.props.data.subject}</div>
                    <div onClick={this.handleClick} id="slidePhoto">
                        <Photo ref="photo" data={this.props.data}/>
                    </div>
                    <div className="post-content" >
                        <div className="post-content-text">
                            {
                                thisText.map(function(textChunk, idx) {
                                    if (idx == thisText.length - 1) {
                                        return textChunk;
                                    } else {
                                        return (
                                            <span>{textChunk}<br/></span>
                                        );
                                    }
                                })
                            }
                        </div>
                        <hr style={{"width": "60%", "margin": "1.1em 0"}}/>
                        <div>
                            <span onClick={this.likePost} className="post-footer-btn post-like-btn round-2">{this.props.data.liked?"Liked!":"Like"}</span>
                            <span onClick={this.clickRepost} className="post-footer-btn post-repost-btn round-2">Repost</span>
                            {is_it_mine?<span onClick={this.deletePost} className="post-footer-btn post-delete-btn round-2">Delete</span>:null}
                        </div>
                    </div>
                </div>
            </div>);
    }
});

module.exports = Post;
