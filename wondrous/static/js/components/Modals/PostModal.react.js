var WondrousActions = require('../../actions/WondrousActions');
var PostStore = require('../../stores/PostStore');
var ModalStore = require('../../stores/ModalStore');
var ReportConstants = require('../../constants/ReportConstants');
var Post = require('./Post.react');
var ModalWrapper = require('./ModalWrapper.react');

var linkify = require('../../utils/Linkify');



var PostModal = React.createClass({
	contextTypes: {
        router: React.PropTypes.func
    },

	mixins:[
        Reflux.connect(ModalStore)
    ],

	getInitialState: function() {
		return {cardOpen:false};
	},

	handleClose: function(evt) {
		WondrousActions.closeCardModal();

		// handled only by children
		evt.preventDefault();
		evt.stopPropagation();
	},

	render: function() {
		divStyle = this.state.cardOpen ? {display:"block"} : {display:"none"};

		return (
				<ModalWrapper handleClose={this.handleClose} divStyle={divStyle}>
                    {PostStore.postError !== null ?
                        <span className="post-not-found-error">{PostStore.postError}</span>
                        :
                        <Post/>
                    }
                </ModalWrapper>
		);
	}
});



module.exports = PostModal;
