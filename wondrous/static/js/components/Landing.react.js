var Post = require('./post.react');
var WondrousAPI = require('../utils/WondrousAPI');
var Link = Router.Link;

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
    username: "john"
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
    username: "tim"
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
    username: "zman0225"
};


var SignedUp = React.createClass({
    render: function(){
        return (
            <div>
                <h3>Thank you, {this.props.data.email}</h3>
                <p>You have referred {this.props.data.referred} people!</p>
                <p>Your reference: </p>
                <input className="landing-input round-5" type="text" value={"https://wondrous.co/refer/" +this.props.data.uuid}/>
            </div>
        );
    }
});

var LandingApp = React.createClass({
    registered: false,
    referrer_info: {},
    mixins: [
        Router.Navigation,
        Router.State,
    ],

    handleData: function(err, res) {
        if (err == null) {
            console.log("asd", res);
            this.registered = true;
            this.referrer_info = res;
            this.forceUpdate();
        } else {
            console.log("asd", err);
        }
    },

    handleClick: function(evt) {
        evt.preventDefault();
        var ref_uuid = this.getParams().ref_uuid;
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
            uuid: this.getParams().uuid
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

        var is_progress = this.getRoutes()[1].name==="progress";
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
                <div className="landing-wrapper-1">
                    <div>
                        <img className="landing-main-logo" src="/static/pictures/p.logo.png" />
                    </div>
                    {!this.registered ?
                        <form onSubmit={this.handleClick}>
                            <h1 className="landing-big-heading">{bigHeading}</h1>

                            <input className="landing-input round-5" ref="email" type="email" spellCheck="off" placeholder="Enter your email!" />
                            <button className="landing-btn round-5" onClick={this.handleClick}>Sign up</button>

                        </form>
                        : <SignedUp data={this.referrer_info} />}
                </div>
                <div className="masonry landing-masonry">
                    <Post data={sp1}/>
                    <Post data={sp2}/>
                    <Post data={sp3}/>
                </div>
                <div className="landing-wrapper-2">
                    <div style={{ paddingBottom: 50 }}>
                        <h2 className="landing-med-heading">Use Wondrous However You Like</h2>

                        <div>
                            <div className="landing-feature">
                                <img className="landing-feature-img round-50" src="/static/pictures/landing/clock2.png" />
                                <h2 className="landing-feature-h2">Read and write meaningful content in just minutes</h2>
                            </div>

                            <div className="landing-feature">
                                <div className="landing-feature-img round-50">
                                    <span style={{ position: "relative", fontSize: 60, color: "rgb(255,255,255)", top: 25, fontFamily: "geosanslight", fontSize: 160 }}>
                                        ?
                                    </span>
                                </div>
                                <h2 className="landing-feature-h2">Can you answer the question of the day?</h2>
                            </div>
                        </div>

                        <div>
                            <div className="landing-feature">
                                <img className="landing-feature-img round-50" src="/static/pictures/landing/trend-line.png" />
                                <h2 className="landing-feature-h2">Join the conversation on trending topics</h2>
                            </div>

                            <div className="landing-feature">
                                <div className="landing-feature-img round-50">
                                    <span style={{ position: "relative", fontSize: 60, color: "rgb(255,255,255)", top: 25, fontFamily: "geosanslight", fontSize: 150 }}>
                                        99
                                    </span>
                                </div>
                                <h2 className="landing-feature-h2">Become a Wondrous influencer</h2>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="landing-wrapper-3">
                    <h2 className="landing-med-heading">Would you like to join Wondrous?</h2>
                    <input className="landing-input landing-input-override round-5" ref="email1" type="email" placeholder="Enter your email!" />
                    <button className="landing-btn landing-btn-override round-5" onClick={this.handleClick}>Sign up</button>
                </div>

                <div className="landing-wrapper-4">
                    <div className="footer-link-wrapper">
                        <span className="footer-link">Contact Us</span>
                        <span className="footer-link">Team</span>
                        <span className="footer-link">Become an influencer</span>
                        <span className="footer-link">Invite your friends</span>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = LandingApp;
