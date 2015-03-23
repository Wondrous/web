var UserStore = require('../../stores/UserStore');
var WondrousAPI = require('../../utils/WondrousAPI');

var ResetPassword = React.createClass({
    mixins: [Router.Navigation, Router.State, Reflux.listenTo(UserStore,'onUserUpdate')],
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
        var page = this.getParams().page

        if(UserStore.loggedIn || typeof page === 'undefined'){
            return (
                <div style={{"position": "relative", "margin": "0 auto", "textAlign": "center", "width": "80%", "top": "5%"}}>
                <h1 ref="header" style={{"fontFamily": "courier","color": "rgb(71,71,71)"}}>You are logged in</h1>
                </div>);
        }

        if (page === 'password') {
            return (
                <div className="loggedout-wrapper">
                    <h1 ref="header" className="loggedout-header">So you forgot something important ;)</h1>
                    <form onSubmit={this.onPasswordReset}>
                        <input className="input-basic round-3" type="email" ref="email" placeholder="Email" />
                        <input className="input-basic loggedout-login-btn round-3" type="submit" ref="signup_button" value="Send Password Reset"/>
                        <div className="loggedout-error">
                            {this.state.error ? this.state.error : null}
                        </div>
                    </form>
                </div>
            );
        } else if (page === 'activate') {
            return (
                <div className="loggedout-wrapper">
                    <h1 ref="header" className="loggedout-header">Need to activate your account?</h1>
                    <form onSubmit={this.onRequestActivation}>
                        <input className="input-basic round-3" type="email" ref="email" placeholder="Email" />
                        <input className="input-basic loggedout-login-btn round-3" type="submit" ref="signup_button" value="Send verification email"/>
                        <div className="loggedout-error">
                            {this.state.error ? this.state.error : null}
                        </div>
                    </form>
                </div>
            );
        }
    }
});


module.exports = ResetPassword
