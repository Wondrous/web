var Post = require('./Post/post.react');
var WondrousAPI = require('../utils/WondrousAPI');

var sp1 = {
    created_at: "2015-02-21T22:09:43.705031",
    is_active: true,
    is_hidden: false,
    mime_type: "image/jpeg",
    name: "John Zimmerman",
    object_id: 31,
    original_id: null,
    ouuid: "31-1a2c20f7-cc69-41e0-932c-5e0ea15f35e3",
    owner_id: null,
    repost_id: null,
    set_to_delete: null,
    subject: "Create beautiful content!",
    text: "Share your thoughts and epress yourself. Have some fun!",
    user_id: 1,
    user_ouuid: "30-876a34a9-8ffd-4b4a-9acb-dc2125fcc205",
    username: "john",
    view_count: 66666,
    like_count:666,
    comment_count:666,
    liked:true
};

var sp2 = {
    created_at: "2015-02-21T22:09:43.705031",
    is_active: true,
    is_hidden: false,
    mime_type: "image/jpeg",
    name: "Tim West",
    object_id: 31,
    original_id: null,
    ouuid: "31-1a2c20f7-cc69-41e0-932c-5e0ea15f35e3",
    owner_id: null,
    repost_id: null,
    set_to_delete: null,
    subject: "Share your amazing experiences with your followers!",
    text: "Tell your stories with your followers!",
    user_id: 1,
    user_ouuid: "30-876a34a9-8ffd-4b4a-9acb-dc2125fcc205",
    username: "tim",
    view_count: 66666,
    like_count:666,
    comment_count:666,
    liked:true
};

var sp3 = {
    created_at: "2015-02-21T22:09:43.705031",
    is_active: true,
    is_hidden: false,
    mime_type: "image/jpeg",
    name: "Ziyuan Liu",
    object_id: 31,
    original_id: null,
    ouuid: "31-1a2c20f7-cc69-41e0-932c-5e0ea15f35e3",
    owner_id: null,
    repost_id: null,
    set_to_delete: null,
    subject: "Brand yourself.",
    text: "Turn yourself into a brand.",
    user_id: 1,
    user_ouuid: "30-876a34a9-8ffd-4b4a-9acb-dc2125fcc205",
    username: "zman0225",
    view_count: 66666,
    like_count:666,
    comment_count:666,
    liked:true
};


var SignedUp = React.createClass({
    onURLClicked : function(){
        this.refs.referURL.getDOMNode().select();
    },
    render: function(){
        return (
            <div>
                <h1 className="landing-big-heading">Thank you, {this.props.data.email} You have referred {this.props.data.referred} people! <br/>Your referral url: </h1>
                <input onClick={this.onURLClicked} readOnly className="landing-input round-5" type="text" ref="referURL" value={"https://wondrous.co/refer/" +this.props.data.uuid}/>

            </div>
        );
    }
});

var LandingApp = React.createClass({
    registered: false,
    referrer_info: {},
    contextTypes: {
        router: React.PropTypes.func
    },

    handleData: function(err, res) {
        if (err == null) {
            this.registered = true;
            this.referrer_info = res;
            this.forceUpdate();
        } else {
            this.refs.email.getDOMNode().value = this.refs.email1.getDOMNode().value = '';
            this.refs.email.getDOMNode().placeholder = this.refs.email1.getDOMNode().placeholder = err.error;
        }
    },

    formSubmit: function(evt) {
        evt.preventDefault();
        var ref_uuid = this.context.router.getCurrentParams().ref_uuid;
        if (typeof ref_uuid === 'undefined') {
            ref_uuid = null;
        }
        console.log("sending",this.refs.email.getDOMNode().value);
        var email = this.refs.email.getDOMNode().value||this.refs.email1.getDOMNode().value
        WondrousAPI.registerReferrer({
            callback: this.handleData,
            email: email,
            ref_uuid: ref_uuid
        });
    },

    getProgress:function() {
        WondrousAPI.getReferrerProgress({
            callback: this.handleData,
            uuid: this.context.router.getCurrentParams().uuid
        });
    },

    onScroll: function(allopen,allclosed,bubbles){
        var lastscroll = window.scrollY;

        var y = window.scrollY, direction = lastscroll <= y ? 1 : -1;

        lastscroll = y;
        if (allclosed && direction == 1)
            return;
        if (allopen && direction == -1)
            return;

        allclosed = allopen = true;

        for (var i=0, bubble; bubble=bubbles[i++];) {
            if(bubble.getAttribute('class').indexOf('landing-in') == -1)
                allclosed = false;
            else
                allopen = false;

            // Move inward
            if ( (direction == 1) && (y + window.innerHeight > bubble.offsetTop*1.65) )
                bubble.setAttribute('class', 'landing-feature landing-in');

            // Move outward
            else if ( (direction == -1) && (y + window.innerHeight < bubble.offsetTop*1.65 + bubble.offsetHeight) )
                bubble.setAttribute('class', 'landing-feature');
        }

    },
    componentDidMount:function() {
        $('.top-banner').hide();
        $('.main-content').removeClass("main-content");
        $(".navbar").css("background-color", "rgb(255,255,255)");

        var is_progress = this.context.router.getCurrentRoutes()[1].name==="progress";
        if (is_progress) {
            this.getProgress();
        }

        // MUST BE REFACTORED
        var bubbles = document.getElementsByClassName('landing-feature'), allopen = true, allclosed = false
        var that = this;
        this.onScroll(allopen,allclosed,bubbles);
        window.addEventListener('scroll', function(){
            that.onScroll(allopen,allclosed,bubbles);
        });
    },

    render: function() {
        var bigHeading = "Wondrous helps you create, share, & discuss your interests like never before."
        return (
            <div>
                <div className="landing-wrapper-1" style={{ height: "100%", top: 0, paddingTop: 50 }} >
                    <div>
                        <img className="landing-main-logo" style={{ width: 300 }} src="/static/pictures/p.logo.png" />
                    </div>
                    <h1 className="landing-big-heading">{bigHeading}</h1>
                    {/*
                    {!this.registered ?
                        <form onSubmit={this.formSubmit}>
                            <input className="landing-input round-5" ref="email" type="email" spellCheck="off" placeholder="Enter your email!" />
                            <button className="landing-btn round-5" >Sign up</button>

                        </form>
                        : <SignedUp data={this.referrer_info} />}
                    */}

                    <div className="footer-links">
                        <a className="social-media-link" href="http://www.facebook.com/WondrousApp">Facebook</a>
                        <a className="social-media-link" href="http://www.instagram.com/Wondrous.co">Instagram</a>
                        <a className="social-media-link" href="http://www.twitter.com/wondrous_co">Twitter</a>
                        <a className="social-media-link" href="http://www.pinterest.com/wondrous_co">Pinterest</a>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = LandingApp;
