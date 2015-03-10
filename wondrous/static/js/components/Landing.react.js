var Post = require('./post.react');
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
    username: "timwest"
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
                <input type="text" style={{"width":"200px"}} value={"https://wondrous.co/refer/" +this.props.data.uuid}/>
            </div>
        );
    }
});

var LandingApp = React.createClass({
    registered: false,
    referrer_info: {},
    mixins: [Router.State],

    handleData: function(err, res) {
        if (err == null) {
            //console.log("asd", res);
            this.registered = true;
            this.referrer_info = res;
            this.forceUpdate();
        } else {}
    },

    handleClick: function() {
        var ref_uuid = this.getParams().ref_uuid;
        if (typeof ref_uuid === 'undefined') {
            ref_uuid = null;
        }

        WondrousAPI.registerReferrer({
            callback: this.handleData,
            email: this.refs.email.getDOMNode().value,
            ref_uuid: ref_uuid
        });
    },

    getProgress:function() {
        WondrousAPI.getReferrerProgress({
            callback: this.handleData,
            uuid: this.getParams().uuid
        });
    },

    componentDidMount:function() {
        var is_progress = this.getRoutes()[1].name==="progress";
        if (is_progress) {
            this.getProgress();
        }
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
                        <div>
                            <h1 className="landing-big-heading">{bigHeading}</h1>

                            <input className="landing-input round-5" ref="email" type="email" placeholder="Enter your email!" />
                            <button className="landing-btn round-5" onClick={this.handleClick}>Sign up</button>

                        </div>
                        : <SignedUp data={this.referrer_info} />}
                </div>
                <div className="masonry" style={{ position: "relative", top: 410, maxWidth: 900, margin: "0 auto", zIndex: 2 }} >
                    <Post data={sp1}/>
                    <Post data={sp2}/>
                    <Post data={sp3}/>
                </div>
                <div className="landing-wrapper-2">
                    <div>
                        <h2 className="landing-med-heading">Use Wondrous However You Like</h2>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = LandingApp;
