var WondrousAPI = require('../utils/WondrousAPI');
var WondrousActions = require('../actions/WondrousActions');

var UserTitle = React.createClass({
    mixins: [Router.Navigation],
    handleProfileData: function(err, data) {
        if (err == null) {
            console.log("profile", data);
            WondrousActions.loadProfileInfo(data);
        } 
    },
    handleWallData: function(err, data) {
        if (err == null) 
            WondrousActions.loadWallPosts(data);
    },
    loadProfileFromServer: function() {
        WondrousAPI.getUserInfo({
            username: this.props.data.username,
            callback: this.handleProfileData
        });
    },
    loadWallFromServer: function() {
        WondrousAPI.getWallPosts({
            username: this.props.data.username,
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
    render: function() {
        var img_src = (typeof this.props.data.user_ouuid !== 'undefined')?"http://mojorankdev.s3.amazonaws.com/"+this.props.data.user_ouuid:"/static/pictures/defaults/p.default-profile-picture.jpg"
        return (
            <div>
                <img className="post-thumb round-50" src={img_src}/>
                <span className="post-identifier ellipsis-overflow">
                    <a onClick={this.handleClick}>{this.props.data.name}</a>
                </span></div>);
    }
});

var Photo = React.createClass({

    render: function() {
        photoStyle = {
            backgroundImage: this.props.data.ouuid?"url(http://mojorankdev.s3.amazonaws.com/"+this.props.data.ouuid+")" :"/static/pictures/500x500.gif"
        };
        ps = {
            overflow: 'hidden',
        };
        var imgStyle = this.props.data.ouuid ? "http://mojorankdev.s3.amazonaws.com/"+this.props.data.ouuid : "/static/pictures/500x500.gif";
        return (
            <div ref="container" className="post-cover-photo cover no-top-border"
            style={ps}>
                <img ref="photo" className="pseudo-bg-img pseudo-bg-img-closed" src={imgStyle}/>
                    <div className="post-subject-text">
                        <div className="post-subject-wrapper">
                            <div className="post-subject-text-position">
                                {this.props.data.subject}
                            </div>
                        </div>
                    </div>
            </div>);
    },
    componentDidMount: function() {
        // Nothing much happening here...

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

        // Trigger Masonry Layout
        var container = document.querySelector('.masonry');
        var msnry = new Masonry(container, {
              transitionDuration : 0,
              itemSelector       : ".masonry-brick",
              columnWidth        : ".grid-sizer", //.grid-sizer
        });
        debugger;
        msnry.layout();
        //console.log(thisBrick);
        $('html, body').animate({ scrollTop: thisBrick.offset().top - 60 }, 300);

    },
    deletePost: function () {
        //WondrousAPI.deletePost({person:1, post_id:2});
        console.log(this.props.data);
    },
    render: function() {
        return (
            <div ref="brick" className="masonry-brick">
                <div ref="post"  className="post-body round-5">
                    <input className="objectID" type="hidden" value={this.props.data.id} />
                    <UserTitle data={this.props.data} />
                    <div onClick={this.handleClick}>
                        <Photo ref="photo" data={this.props.data}/>
                    </div>
                    <div className="post-content" style={{"display":"none"}}>
                        {this.props.data.text}
                        <hr style={{"width": "60%"}}/>
                        <div>
                            <span className="post-footer-btn post-like-btn round-2">Like!</span>
                            <span className="post-footer-btn post-repost-btn round-2">Repost</span>
                            <span onClick={this.deletePost} className="post-footer-btn post-delete-btn round-2">Delete</span>
                        </div>
                    </div>
                </div>
            </div>)
    }
});

module.exports = Post;
