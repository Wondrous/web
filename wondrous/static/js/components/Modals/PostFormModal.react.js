var WondrousActions = require('../../actions/WondrousActions');
var ModalStore = require('../../stores/ModalStore');
var WondrousConstants = require('../../constants/WondrousConstants');
var PostForm = require('./PostForm.react');

var PostFormModal = React.createClass({
	mixins:[
        Reflux.listenTo(ModalStore,"onModalChange")
    ],

    onModalChange: function(){
        this.forceUpdate();
    },

	handleClose: function(evt) {
        if (evt.target==this.refs.closeContainer.getDOMNode()){
			var isPictureModal = (ModalStore.modalType == WondrousConstants.MODALTYPE_PICTURE);

	        if (!isPictureModal) {
	            WondrousActions.togglePostModal();
	        } else {
	            WondrousActions.togglePictureModal();
	        }
            evt.preventDefault();
            evt.stopPropagation();
        }
	},

	render: function() {
		divStyle = ModalStore.postFormOpen ? {display:"block"} : {display:"none"};

		return (
			<div onClick={this.handleClose} className="_dimmer" style={divStyle}>

				<div className="vertical-center-wrapper">
					<div ref="closeContainer" className="vertical-center">

						<div className="modal-wrapper">
                            <div className="modal round-5">
                                <PostForm />
                            </div>
						</div>

					</div>
				</div>

			</div>
		);
	}
});



module.exports = PostFormModal;
