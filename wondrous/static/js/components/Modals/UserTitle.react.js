var WondrousActions = require('../../actions/WondrousActions');
var checkLogin = require('../../utils/Func').checkLogin;
var URLGenerator = require('../../utils/URLGenerator');

var UserTitle = React.createClass({
    repost: null,

    handleClick: function(evt) {
        if (typeof this.props.data.username !== 'undefined') {
            if (checkLogin()) {
                WondrousActions.closeCardModal();
            } else {
                evt.preventDefault();
            }
        }
    },

    handleClickOnOwner: function(evt) {
        if (typeof this.repost.username !== 'undefined') {
            if (checkLogin()) {
                WondrousActions.closeCardModal();
            } else {
                evt.preventDefault();
            }
        }
    },

    render: function() {
        this.repost = null;

        if (typeof this.props.data === 'undefined' || this.props.data.subject.length==0) {
            return (<div></div>);
        }

        var name = this.props.data.name;
        var un = this.props.data.username;
        var hrefRepostPlaceholder = '';
        if (this.props.data.repost_id!=null) {
            this.repost = this.props.data.repost;
            hrefRepostPlaceholder = '/'+this.repost.username;
        }

        var img_src = (typeof this.props.data.user_ouuid !== 'undefined' ) ? URLGenerator.generate45(this.props.data.user_ouuid) : "/static/pictures/defaults/p.default-profile-picture.jpg";
        var hrefPlaceholder = '/'+this.props.data.username;

        return (
            <div>
                <img ref="usericon" className="post-thumb round-50" src={img_src}/>
                <span className="post-identifier ellipsis-overflow" style={this.repost ? {top:0} : null}>
                    <Link onClick={this.handleClick} to={hrefPlaceholder}>
                        {name} (@{un})
                    </Link>
                    {this.repost ? <img src="/static/pictures/icons/repost/repost_gray_shadow.svg" className="post-general-icon" style={{height: 22, width: 22, top: 7}} /> : null}
                    {this.repost ? <Link className="recipient" to={hrefRepostPlaceholder} onClick={this.handleClickOnOwner}>{this.repost.name} (@{this.repost.username})</Link> : null}
                </span>
            </div>
        );
    }
});


module.exports = UserTitle;
