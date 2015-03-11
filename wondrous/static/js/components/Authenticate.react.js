var WondrousActions = require('../actions/WondrousActions');
var WondrousAPI = require('../utils/WondrousAPI');
var UserStore = require('../stores/UserStore');
var LoginStore = require('../stores/LoginStore');
var Link = Router.Link;

var PasswordResetPage = React.createClass({
    mixins: [Router.State, Router.Navigation],
    getInitialState: function(){
        return {error:null};
    },
    onPasswordReset: function(err,res){
        if(err==null){
            this.refs.passwordConfirm.getDOMNode().value = this.refs.password.getDOMNode().value = '';
            this.transitionTo('/login');
        }else{
            this.setState({error:err.error});
        }
    },

    onSubmitReset: function(evt){
        evt.preventDefault();
        this.setState({error:null});
        if (this.refs.password.getDOMNode().value!==this.refs.passwordConfirm.getDOMNode().value){
            this.setState({error:'your passwords do not match :('})
        }else{
            var verification = this.getParams().verification;
            if (typeof verification !== 'undefined'){
                WondrousAPI.passwordReset({
                    verification_code:verification,
                    password:this.refs.passwordConfirm.getDOMNode().value.trim(),
                    callback:this.onPasswordReset
                });
            }
        }
    },

    render: function(){
        if(UserStore.loggedIn){
            return (
                <div style={{"position": "relative", "margin": "0 auto", "textAlign": "center", "width": "80%", "top": "5%"}}>
                <h1 ref="header" style={{"fontFamily": "courier","color": "rgb(71,71,71)"}}>You are logged in</h1>
                </div>);
        }

        return (
            <div style={{"position": "relative", "margin": "0 auto", "textAlign": "center", "width": "80%", "top": "10%"}}>
                <h1 style={{"fontFamily": "courier","color": "rgb(71,71,71)"}}>Password Reset</h1>
                <form method="POST" onSubmit={this.onSubmitReset}>
                    <div>
                        <input className="input-basic round-3" type="password" ref="password" placeholder="New Password" />
                    </div>
                    <div>
                        <input className="input-basic round-3" type="password" ref="passwordConfirm" placeholder="Confirm Password" />
                    </div>

                    <div>
                        <input className="input-basic round-3" type="submit" value="Reset" />
                    </div>
                </form>
                {this.state.error?this.state.error:null}
            </div>
        );
    }
});

var VerificationPage = React.createClass({
    mixins: [Router.State, Router.Navigation],
    getInitialState: function(){
        return {error:null};
    },
    onVerification: function(err,res){
        if(err==null){
            WondrousActions.auth();
            this.transitionTo('/');
        }else{
            this.setState({error:err.error});
        }
    },
    componentDidMount: function(){
        var verification = this.getParams().verification;
        if (typeof verification !== 'undefined'){
            WondrousAPI.verifyUser({
                verification_code:verification,
                callback:this.onVerification
            })
        }
    },

    render: function(){
        return (
            <div>
                {this.state.error?this.state.error:null}
            </div>
        );
    }
});

var ResetPage = React.createClass({
    mixins: [Router.State, Router.Navigation, Reflux.listenTo(UserStore,'onUserUpdate')],
    onUserUpdate: function(){
        if(UserStore.loggedIn){
            this.forceUpdate();
        }
    },
    getInitialState: function(){
        return {error:null,result:null}
    },
    onPasswordResetHandler: function(err,res){
        if(err==null){
            this.refs.header.getDOMNode().innerHTML="Password link reset sent to: "+this.refs.email.getDOMNode().value.trim();
        }else{
            this.setState({error:err.error});
        }
        this.refs.email.getDOMNode().value = '';
    },
    onPasswordReset: function(evt){
        evt.preventDefault();
        WondrousAPI.requestPasswordReset({
            email:this.refs.email.getDOMNode().value.trim(),
            callback: this.onPasswordResetHandler
        })
    },

    onRequestActivationHandler: function(err,res){
        if(err==null){
            this.refs.header.getDOMNode().innerHTML="Verification Email sent to: "+this.refs.email.getDOMNode().value.trim();
        }else{
            this.setState({error:err.error});
        }

        this.refs.email.getDOMNode().value = '';
    },

    onRequestActivation: function(evt){
        evt.preventDefault();
        WondrousAPI.requestVerification({
            email:this.refs.email.getDOMNode().value.trim(),
            callback: this.onRequestActivationHandler
        })
    },
    render: function(){
        var page = this.getParams().page;
        if(UserStore.loggedIn || typeof page === 'undefined'){
            return (
                <div style={{"position": "relative", "margin": "0 auto", "textAlign": "center", "width": "80%", "top": "5%"}}>
                <h1 ref="header" style={{"fontFamily": "courier","color": "rgb(71,71,71)"}}>You are logged in</h1>
                </div>);
        }

        if(page==='password'){
            return (
                <div style={{"position": "relative", "margin": "0 auto", "textAlign": "center", "width": "80%", "top": "5%"}}>
                    <h1 ref="header" style={{"fontFamily": "courier","color": "rgb(71,71,71)"}}>So... you forgot something important ;)</h1>
                    <form onSubmit={this.onPasswordReset}>
                    <input id="focusInput" className="input-basic round-3" type="email" ref="email" placeholder="Email" />
                        <input className="input-basic round-3" type="submit" ref="signup_button" value="Send Password Reset"/>
                    </form>
                    {this.state.error?this.state.error:null}
                </div>
            );
        }else if(page==='activate'){
            return (
                    <div style={{"position": "relative", "margin": "0 auto", "textAlign": "center", "width": "80%", "top": "5%"}}>
                        <h1 ref="header" style={{"fontFamily": "courier","color": "rgb(71,71,71)"}}>Need to activate your account?</h1>
                        <form onSubmit={this.onRequestActivation}>
                        <input id="focusInput" className="input-basic round-3" type="email" ref="email" placeholder="Email" />
                            <input className="input-basic round-3" type="submit" ref="signup_button" value="Send verification email"/>
                        </form>
                        {this.state.error?this.state.error:null}
                    </div>
                );
        }
    }
});

var Signup = React.createClass({
    err: null,
    good: true,
    mixins: [
        Router.Navigation,
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
            this.transitionTo('/');
        }
    },
    onRegister: function(evt){
        evt.preventDefault();
        // Order matters: name, username, email, password.
        // Be sure to keep this updated with the associated
        // method in WondrousActions.js
        WondrousActions.register(
            this.refs.name.getDOMNode().value.trim(),
            this.refs.username.getDOMNode().value.trim(),
            this.refs.email.getDOMNode().value.trim(),
            this.refs.password.getDOMNode().value
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
        console.log(UserStore);
        if(UserStore.loggedIn){
            this.transitionTo('/');
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
                {this.err}
                <div className="login-accept-terms" style={{"textAlign": "center","margin": "10px auto","width": "300px"}}>
                    By clicking the above button and logging in to Wondrous, you have reviewed and accepted our Privacy Policy and Terms of Service
                </div>
            </div>
        );
    }
});

module.exports = {Login: Login, Signup: Signup, ResetPage:ResetPage, VerificationPage:VerificationPage, PasswordResetPage:PasswordResetPage};
