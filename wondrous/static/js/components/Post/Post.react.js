var WondrousActions = require('../../actions/WondrousActions');
var WondrousAPI = require('../../utils/WondrousAPI');
var UserStore = require('../../stores/UserStore');
var checkLogin = require('../../utils/Func').checkLogin;
var Photo = require('./Photo.react');
var UserTitle = require('./UserTitle.react');

var Post = React.createClass({
    mixins: [Router.Navigation],
    handleClick: function(evt) {
        if (!evt.metaKey){
            evt.preventDefault();

            if (typeof this.props.data.id !=='undefined'){
                WondrousActions.newPostLoad(this.props.data.id);
            }

            WondrousActions.updatePost(this.props.data);
            WondrousActions.openCardModal();
        }
    },

    render: function() {
        if (typeof this.props.data === 'undefined' || typeof this.props.data.username === 'undefined') {
            return (<div></div>);
        }

        var repost = null;
        var is_it_mine = this.props.data.username === UserStore.user.username;

        if (this.props.data.hasOwnProperty('repost')) {
            repost = this.props.data.repost;
            this.props.data.text = repost.text;
            this.props.data.subject = repost.subject;
        }

        return (
            <div ref="brick" className="masonry-brick">
                <div ref="post" className="post-body round-3">
                    <div style={{ backgroundColor: "#FFFFFF", position: "relative" }}>
                        <UserTitle data={this.props.data} />
                    </div>

                    {/*<div className="post-title">{this.props.data.subject}</div>*/}
                    <a href={"/post/"+this.props.data.id} onClick={this.handleClick} id="slidePhoto">
                        <Photo ref="photo" data={this.props.data}/>
                    </a>
                </div>
            </div>
            );
    }
});

module.exports = Post;
