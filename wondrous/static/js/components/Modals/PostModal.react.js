var WondrousActions = require('../../actions/WondrousActions');
var PostStore = require('../../stores/PostStore');
var UserStore = require('../../stores/UserStore');
var ModalStore = require('../../stores/ModalStore');
var ReportConstants = require('../../constants/ReportConstants');
var Post = require('./Post.react');
var ModalWrapper = require('./ModalWrapper.react');

var linkify = require('../../utils/Linkify');



var PostModal = React.createClass({
	mixins:[
        Reflux.listenTo(PostStore,"onPostUpdate"),
        Reflux.listenTo(ModalStore,"onModalChange"),
		Router.State
    ],

    onModalChange: function(){
        this.forceUpdate();
    },

	onPostUpdate: function(postData) {
		this.setState(postData);
	},

	getInitialState: function() {
		return UserStore;
	},

	handleClose: function(evt) {
		if(!UserStore.loggedIn&UserStore.loaded&(typeof this.getParams().post_id !=='undefined'))
		{
			return;
		}
		// handled only by children
		WondrousActions.closeCardModal();
		evt.preventDefault();
		evt.stopPropagation();
	},

	render: function() {
        if (typeof this.state.post === 'undefined') {
            return (<div></div>);
        }

		divStyle = ModalStore.cardOpen ? {display:"block"} : {display:"none"};

		return (
				<ModalWrapper handleClose={this.handleClose} divStyle={divStyle}>
                    {PostStore.postError !== null ?
                        <span className="post-not-found-error">{PostStore.postError}</span>
                        :
                        <Post data={this.state.post} comments={this.state.comments}/>
                    }
                </ModalWrapper>
		);
	}
});



module.exports = PostModal;
