var UserStore = require('../../stores/UserStore');
var LoginStore = require('../../stores/LoginStore');
var WondrousActions = require('../../actions/WondrousActions');

var Login = React.createClass({
    mixins: [
        Router.Navigation,
        Reflux.listenTo(UserStore,'onUserUpdate'),
        Reflux.listenTo(LoginStore,'onLoginError')
    ],
    componentsWillMount: function(){
        this.err = '';
    },
    onUserUpdate: function(userData){
        if(UserStore.loggedIn){
            this.transitionTo('/');
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
            <div style={{"position": "relative", "margin": "0 auto", "textAlign": "center", "width": "80%", "top": "10%"}}>
                <h1 style={{"fontFamily": "courier","color": "rgb(71,71,71)"}}>Log in</h1>
                <form onSubmit={this.onLogin}>
                    <div>
                        <input id="focusInput" className="input-basic round-3" type="text" ref="user_identification" name="user_identification" placeholder="Email or username" />
                    </div>
                    <div>
                        <input className="input-basic round-3" type="password" name="password" ref="password" placeholder="Password" />
                    </div>
                    <div style={{"fontWeight": "300","color": "rgb(220,100,100)","margin": "5px"}}>

                    </div>
                    <Link to="/reset_request/password">forgot password</Link>

                    <div>
                        <input className="input-basic round-3" type="submit" name="login_button" value="Log in!" />
                    </div>
                </form>
                {error}
                <div className="login-accept-terms" style={{"textAlign": "center","margin": "10px auto","width": "300px"}}>
                    By clicking the above button and logging in to Wondrous, you have reviewed and accepted our Privacy Policy and Terms of Service
                </div>
            </div>
        );
    }
});

module.exports = Login;
