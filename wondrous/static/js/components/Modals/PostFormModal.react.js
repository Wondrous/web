var WondrousActions = require('../../actions/WondrousActions');
var ModalStore = require('../../stores/ModalStore');
var WondrousConstants = require('../../constants/WondrousConstants');
var PostForm = require('./PostForm.react');
var ModalWrapper = require('./ModalWrapper.react');

var PostFormModal = React.createClass({
	mixins:[
        Reflux.listenTo(ModalStore,"onModalChange")
    ],
	componentDidMount: function(){
		var con = $(this.refs.modalWrapper.getDOMNode());
		con.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',function(){
			$(this).removeClass("animated fadeIn");
		});
	},
    onModalChange: function(){
        this.forceUpdate();
		if (ModalStore.postFormOpen){
			var con = $(this.refs.modalWrapper.getDOMNode());
			con.addClass("animated fadeIn");
		}
    },

	handleClose: function(evt) {
		var con = $(this.refs.modalWrapper.getDOMNode());
		var isPictureModal = (ModalStore.modalType == WondrousConstants.MODALTYPE_PICTURE);

		if (!isPictureModal) {
			WondrousActions.togglePostModal();
		} else {
			WondrousActions.togglePictureModal();
		}

        evt.preventDefault();
        evt.stopPropagation();
	},

	render: function() {
		divStyle = ModalStore.postFormOpen ? {display:"block"} : {display:"none"};

		return (
			<ModalWrapper ref="modalWrapper" handleClose={this.handleClose} divStyle={divStyle}>
                <PostForm />
            </ModalWrapper>
		);
	}
});



module.exports = PostFormModal;
