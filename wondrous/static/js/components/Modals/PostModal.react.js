var WondrousActions = require('../../actions/WondrousActions');
var PostStore = require('../../stores/PostStore');
var UserStore = require('../../stores/UserStore');
var ModalStore = require('../../stores/ModalStore');
var ReportConstants = require('../../constants/ReportConstants');
var Post = require('./Post.react');

var linkify = require('../../utils/Linkify');

var PostModal = React.createClass({
	mixins:[
        Reflux.listenTo(PostStore,"onPostUpdate"),
        Reflux.listenTo(ModalStore,"onModalChange")
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
        if (evt.target==this.refs.closeContainer.getDOMNode()){
            WondrousActions.closeCardModal();
            evt.preventDefault();
            evt.stopPropagation();
        }
	},

	render: function() {
        if (typeof this.state.post === 'undefined') {
            return (<div></div>);
        }
		divStyle = ModalStore.cardOpen ? {display:"block"} : {display:"none"};

		return (
			<div onClick={this.handleClose} className="_dimmer" style={divStyle}>

				<div className="vertical-center-wrapper">
					<div ref="closeContainer" className="vertical-center">

						<div className="modal-wrapper">
                            <div className="modal round-5">
                                {PostStore.postError !== null ?
                                    <span className="post-not-found-error">{PostStore.postError}</span>
                                    :
                                    <Post data={this.state.post} comments={this.state.comments}/>
                                }
                            </div>
						</div>

					</div>
				</div>

			</div>
		);
	}
});



module.exports = PostModal;
