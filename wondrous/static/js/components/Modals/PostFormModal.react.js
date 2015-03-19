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
		if (ModalStore.postFormOpen){
			var con = $(this.refs.modalWrapper.getDOMNode());
			con.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',function(){
				$(this).removeClass("animated fadeIn");
			});

			con.addClass("animated fadeIn");
		}
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
                            <div className="modal round-5" ref="modalWrapper">
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
