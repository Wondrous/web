var UserStore = require('../../stores/UserStore');
var LoginStore = require('../../stores/LoginStore');
var WondrousActions = require('../../actions/WondrousActions');

var Signup = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },
    err: null,
    good: true,
    mixins: [
        Reflux.listenTo(UserStore,'onUserUpdate'),
        Reflux.listenTo(LoginStore,'onLoginError')
    ],
    changeHandler: function(){
        // Order matters: name, username, email, password.
        // Be sure to keep this updated with the associated
        // method in WondrousActions.js
        WondrousActions.registerCheck(
            this.refs.name.getDOMNode().value.trim(),
            this.refs.username.getDOMNode().value.trim(),
            this.refs.email.getDOMNode().value.trim(),
            this.refs.password.getDOMNode().value
        );
    },
    onLoginError: function(errMessage){
        this.err = errMessage;
        if (this.err==null){
            this.good = true;
        }else{
            this.good = false;
        }
        console.log("good>",this.good);
        this.forceUpdate();
    },
    onUserUpdate: function(userData){
        if(UserStore.loggedIn){
            this.context.router.transitionTo('/');
        }
    },
    onRegister: function(evt){
        evt.preventDefault();
        // Order matters: name, username, email, password.
        // Be sure to keep this updated with the associated
        // method in WondrousActions.js
        var code = (typeof this.context.router.getCurrentParams().verification_code !== 'undefined')?this.context.router.getCurrentParams().verification_code:null;

        WondrousActions.register(
            this.refs.name.getDOMNode().value.trim(),
            this.refs.username.getDOMNode().value.trim(),
            this.refs.email.getDOMNode().value.trim(),
            this.refs.password.getDOMNode().value,
            code
        );
    },
    render: function() {
        return (
            <div style={{"position": "relative", "margin": "0 auto", "textAlign": "center", "width": "80%", "top": "5%"}}>
                <h1 style={{"fontFamily": "courier","color": "rgb(71,71,71)"}}>Sign up :)</h1>
                <form onSubmit={this.onRegister}>
                    <div>
                        <input onChange={this.changeHandler} id="focusInput" className="input-basic round-3" type="text" name="name" ref="name" placeholder="name" maxLength="30"/>
                    </div>
                    <div>
                        <input onChange={this.changeHandler} id="usernameInput" className="input-basic round-3" type="text" name="username" ref="username" placeholder="Username" maxLength="15"/>
                        <span style={{"position":"absolute"}} ></span>
                    </div>
                    <div>
                        <input onChange={this.changeHandler} className="input-basic round-3" type="text" name="email" ref="email" placeholder="Email"/>
                    </div>
                    <div>
                        <input onChange={this.changeHandler} className="input-basic round-3" type="password" name="password" ref="password" placeholder="Password"/>
                    </div>
                    <div style={{"fontWeight":"300","color":"rgb(220,100,100)","margin":"5px"}}></div>
                    <div>
                        {!this.good ?
                            <input onChange={this.changeHandler} className="input-basic round-3" type="submit" name="signup_button" ref="signup_button" value="Join Wondrous!." disabled/>:
                            <input onChange={this.changeHandler} className="input-basic round-3" type="submit" name="signup_button" ref="signup_button" value="Join Wondrous!."/>}
                    </div>
                </form>
                {this.err}
                <div className="login-accept-terms" style={{"textAlign":"center"," margin":"10px auto"," width":"300px"}}>
                    By clicking the above button and signing up for Wondrous, you have reviewed and accepted our Privacy Policy and Terms of Service
                </div>
            </div>
        );
    }
});

module.exports = Signup;
