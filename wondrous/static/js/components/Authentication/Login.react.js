var UserStore = require('../../stores/UserStore');
var LoginStore = require('../../stores/LoginStore');
var WondrousActions = require('../../actions/WondrousActions');

var Login = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },
    mixins: [
        Reflux.listenTo(UserStore,'onUserUpdate'),
        Reflux.listenTo(LoginStore,'onLoginError')
    ],
    componentsWillMount: function(){
        this.err = '';
    },
    onUserUpdate: function(userData){
        if(UserStore.loggedIn){
            this.context.router.transitionTo('/');
            WondrousActions.auth();
        }
    },
    onLoginError: function(errMessage){
        this.err = errMessage;
        this.forceUpdate();
    },
    onLogin: function(evt){
        evt.preventDefault();
        WondrousActions.login(
            this.refs.user_identification.getDOMNode().value.trim(),
            this.refs.password.getDOMNode().value
        );
    },
    render: function(){
        var error = this.err;
        console.log(error,'verification',error==='verification')
        if (this.err&&this.err.hasOwnProperty('error')&&error.error==='verification'){
            error = <div> You need to verify your email first, <Link to='/reset_request/activate'>Click here to resend</Link></div>;
        }

        return (
            <div className="loggedout-wrapper">
                <h1 className="loggedout-header">Log in</h1>
                <form onSubmit={this.onLogin}>
                    <div>
                        <input className="input-basic round-3" type="text" ref="user_identification" name="user_identification" placeholder="Email or username" />
                    </div>
                    <div>
                        <input className="input-basic round-3" type="password" name="password" ref="password" placeholder="Password" />
                    </div>
                    <div className="loggedout-error">
                        {error}
                    </div>

                    <div>
                        <input className="input-basic loggedout-login-btn round-15" type="submit" name="login_button" value="Log in!" />
                    </div>

                    <Link style={{ fontSize: 14, color: "rgb(170,170,170)", display: "block", marginTop: 10 }} to="/reset_request/password">
                        Forgot Password
                    </Link>
                </form>
                <div className="login-accept-terms" style={{"textAlign": "center","margin": "10px auto","width": "300px"}}>
                    By clicking the above button and logging in to Wondrous, you have reviewed and accepted our Privacy Policy and Terms of Service
                </div>
            </div>
        );
    }
});

module.exports = Login;
