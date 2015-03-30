var WondrousActions = require('../../actions/WondrousActions');

var LoggedOut = React.createClass({
    clearModals: function(){
        WondrousActions.clearModal();
    },
    render: function(){
        var timeNow = new Date();

        var openSignUp = timeNow>= new Date(2015,5,1,0,0,0);
        return (
            <div className="loggedout-modal-signup-wrapper">
                
                <img src="https://s3-us-west-2.amazonaws.com/wondrousstatic/pictures/p.logo.png" className="loggedout-modal-signup-logo" />
                <p className="loggedout-modal-signup-prompt">
                    Wondrous hasn't launched yet, but right now you can join the waitlist to get early access!
                </p>
                {openSignUp ?
                    <Link className="index-lo-big-link signup-big-link round-5" to="signup" onClick={this.clearModals}>
                       Sign up
                    </Link>
                    :
                    <div style={{ width: "90%", margin: "0 auto" }} >
                        <input type="text" spellCheck={"false"} placeholder="Enter your email" className="loggedout-modal-signup-input" />
                        <button className="loggedout-modal-signup-submit">Request early access</button>
                    </div>
                }
                <div className="loggedout-modal-signup-footer">
                    For the lucky few: <Link className="loggedout-modal-signup-footer-link" to="login" onClick={this.clearModals}>Log in</Link>
                </div>
            </div>
        );
    }
});


module.exports = LoggedOut;
