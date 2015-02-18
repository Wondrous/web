var UserStore = require('../stores/UserStore');

var SideMenu = React.createClass({
    getInitialState: function() {
        return {data:UserStore.isShowingSideBar()};
    },
    componentDidMount: function() {
        UserStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function(){
        UserStore.removeChangeListener(this._onChange);
    },
    render:function(){
        var displayStyle = {
            display: this.state.data?"block":"none"
        };

        return(
            <div className="sidemenu" style={displayStyle}>
                <div className="sidemenuOptions _open_bmo">
                    <a href="/info/about/" className="dropdown-a __noPush">
                        <div className="dropdown-element">About us</div>
                    </a>

                    <a href="/info/tos/" className="dropdown-a __noPush">
                        <div className="dropdown-element">Terms of Service</div>
                    </a>

                    <a href="/info/privacy/" className="dropdown-a __noPush">
                        <div className="dropdown-element">Privacy</div>
                    </a>

                    <a href="/info/settings/" className="dropdown-a">
                        <div className="dropdown-element">Account settings</div>
                    </a>

                    <a href="/info/feedback/" className="dropdown-a">
                        <div className="dropdown-element">Feedback</div>
                    </a>

                    <hr className="dropdown-hr"/>
                    <a href="/auth/logout/" className="dropdown-element __noPush" style={{"textDecoration": "none","display": "block"}}>Log out</a>
                </div>
            </div>
        );
    },

    _onChange:function(){
        this.setState({data:UserStore.isShowingSideBar()});
    }
})

module.exports = SideMenu;
