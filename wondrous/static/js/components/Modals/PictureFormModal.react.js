var WondrousActions = require('../../actions/WondrousActions');
var ModalStore = require('../../stores/ModalStore');
var WondrousConstants = require('../../constants/WondrousConstants');
var PictureForm = require('./PictureForm.react');
var ModalWrapper = require('./ModalWrapper.react');

var PictureFormModal = React.createClass({
	mixins:[
        Reflux.listenTo(ModalStore,"onModalChange")
    ],

	componentDidMount: function(){
		var con = $(this.refs.modalWrapper.getDOMNode());
		con.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',function(){
			$(this).removeClass("animated bounceInDown");
		});
	},

    onModalChange: function(){
        this.forceUpdate();
		if (ModalStore.pictureFormOpen){
			var con = $(this.refs.modalWrapper.getDOMNode());
			con.addClass("animated bounceInDown");
		}
    },

	handleClose: function(evt) {
		var con = $(this.refs.modalWrapper.getDOMNode());
        WondrousActions.togglePictureModal();


        evt.preventDefault();
        evt.stopPropagation();
	},

	render: function() {
		divStyle = ModalStore.pictureFormOpen ? {display:"block"} : {display:"none"};

		return (
			<ModalWrapper handleClose={this.handleClose} isPicture={true} divStyle={divStyle}>
                <PictureForm ref="modalWrapper"/>
            </ModalWrapper>
		);
	}
});



module.exports = PictureFormModal;
