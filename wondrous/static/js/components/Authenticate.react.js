var WondrousAPI = require('../utils/WondrousAPI');
var WondrousActions = require('../actions/WondrousActions');
var UserStore = require('../stores/UserStore');
var Link = Router.Link;

var LoggedOut = React.createClass({
    mixins: [ Router.Navigation ],
    componentDidMount: function(){
        UserStore.addChangeListener(this._onChange);
        this._onChange();
    },
    // Remove change listeners from stores
    componentWillUnmount: function(){
        UserStore.removeChangeListener(this._onChange);
    },
    render: function(){
        return (
            <div style={{"position": "relative", "margin": "0 auto", "textAlign": "center", "width": "80%", "maxWidth": "730px", "top": "10%"}}>
                <img src="/static/pictures/p.logo.png" style={{"width": "350px", "height": "auto"}}/>
                <p style={{"fontFamily": "helvetica, arial, sans-serif","color": "rgb(71,71,71)","fontSize": "20px","fontWeight": "100","width": "75%","margin": "20px auto"}}>
                    Some amazing slogan goes here to fill up space on our temporary home page
                </p>

                <div style={{"padding": "40px 0"}}>
                    <Link className="index-lo-big-link signup-big-link round-5" to="signup">Sign up</Link>
                    <Link className="index-lo-big-link blue-big-link round-3" to="login">Log in</Link>
                </div>
            </div>
        );
    },
    _onChange: function(){
        if(UserStore.isUserLoggedIn()) {
            this.replaceWith('/feed');
        }
    }
});

var Signup = React.createClass({
    err: null,
    good: false,
    handleCheck:function(err, res) {
        if(err != null){
            this.err = err;
            this.good = false;
        }else{
            this.err = null;
            this.good = true;
        }
        this.forceUpdate();
    },
    changeHandler: function(){
        var username = this.refs.username.getDOMNode().value.trim();
        WondrousAPI.registerCheck({
            callback: this.handleCheck,
            name: this.refs.name.getDOMNode().value.trim(),
            username: this.refs.username.getDOMNode().value.trim(),
            email: this.refs.email.getDOMNode().value.trim(),
            password: this.refs.password.getDOMNode().value
        });
    },

    render: function() {

        return (
            <div style={{"position": "relative", "margin": "0 auto", "textAlign": "center", "width": "80%", "top": "5%"}}>
                <h1 style={{"fontFamily": "courier","color": "rgb(71,71,71)"}}>Sign up :)</h1>
                <form action="/signup/" method="POST">
                    <div>
                        <input onChange={this.changeHandler} id="focusInput" className="input-basic round-3" type="text" name="name" ref="name" placeholder="name"/>
                    </div>
                    <div>
                        <input onChange={this.changeHandler} className="input-basic round-3" type="text" name="email" ref="email" placeholder="Email"/>
                    </div>
                    <div>
                        <input onChange={this.changeHandler} id="usernameInput" className="input-basic round-3" type="text" name="username" ref="username" placeholder="Username" maxLength="15"/>
                        <span style={{"position":"absolute"}} ></span>
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

    render: function(){
        return (
            <div style={{"position": "relative", "margin": "0 auto", "textAlign": "center", "width": "80%", "top": "10%"}}>
                <h1 style={{"fontFamily": "courier","color": "rgb(71,71,71)"}}>Log in</h1>
                <form action="/login/" method="POST">
                    <div>
                        <input id="focusInput" className="input-basic round-3" type="text" ref="identifier" name="user_identification" placeholder="Email or username" />
                    </div>
                    <div>
                        <input className="input-basic round-3" type="password" name="password" ref="password" placeholder="Password" />
                    </div>
                    <div style={{"fontWeight": "300","color": "rgb(220,100,100)","margin": "5px"}}>

                    </div>
                    <div>
                        <input className="input-basic round-3" type="submit" name="login_button" value="Log in!" />
                    </div>
                </form>

                <div className="login-accept-terms" style={{"textAlign": "center","margin": "10px auto","width": "300px"}}>
                    By clicking the above button and logging in to Cloaky, you have reviewed and accepted our Privacy Policy and Terms of Service
                </div>
            </div>
        );
    }
});

module.exports = {Login: Login, Signup: Signup, LoggedOut: LoggedOut};
