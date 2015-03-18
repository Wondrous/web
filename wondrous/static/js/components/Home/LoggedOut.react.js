var WondrousActions = require('../../actions/WondrousActions');

var LoggedOut = React.createClass({
    clearModals: function(){
        WondrousActions.clearModal();
    },
    render: function(){
        var timeNow = new Date();

        var openSignUp = timeNow>= new Date(2015,5,1,0,0,0);
        return (
            <div style={{"position": "relative", "margin": "0 auto", "textAlign": "center", "width": "80%", "maxWidth": "730px", "top": "10%"}}>
                <img src="/static/pictures/p.logo.png" style={{"width": "350px", "height": "auto"}}/>
                <p style={{"fontFamily": "helvetica, arial, sans-serif","color": "rgb(71,71,71)","fontSize": "20px","fontWeight": "100","width": "75%","margin": "20px auto"}}>
                    Some amazing slogan goes here to fill up space on our temporary home page
                </p>
                <div style={{"padding": "40px 0"}}>
                {openSignUp?<Link className="index-lo-big-link signup-big-link round-5" to="signup" onClick={this.clearModals}>Sign up</Link>:
                <Link className="index-lo-big-link signup-big-link round-5" to="landingBare" onClick={this.clearModals}>Join the line!</Link>}
                    <Link className="index-lo-big-link blue-big-link round-3" to="login" onClick={this.clearModals}>Log in</Link>
                </div>
            </div>
        );
    }
});


module.exports = LoggedOut;
