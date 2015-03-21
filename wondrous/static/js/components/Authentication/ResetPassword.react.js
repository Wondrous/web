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


module.exports = ResetPassword
