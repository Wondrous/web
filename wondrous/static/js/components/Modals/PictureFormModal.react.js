var WondrousActions = require('../../actions/WondrousActions');
var ModalStore = require('../../stores/ModalStore');
var WondrousConstants = require('../../constants/WondrousConstants');
var PictureForm = require('./PictureForm.react');
var ModalWrapper = require('./ModalWrapper.react');

var PictureFormModal = React.createClass({
	mixins:[
        Reflux.connect(ModalStore)
    ],
	getInitialState: function(){
		return {pictureFormOpen:false};
	},
	componentDidMount: function(){
		var con = $(this.refs.modalWrapper.getDOMNode());
		con.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',function(){
			$(this).removeClass("animated bounceInDown");
		});
	},

	componentDidUpdate: function(){
		if (this.state.pictureFormOpen){
			var con = $(this.refs.modalWrapper.getDOMNode());
			con.addClass("animated bounceInDown");
		}
	},

	handleClose: function(evt) {
		var con = $(this.refs.modalWrapper.getDOMNode());
        WondrousActions.closePictureModal();

		if (typeof evt !== 'undefined' && evt){
			evt.preventDefault();
			evt.stopPropagation();
		}
	},

	render: function() {
		divStyle = {
			display: this.state.pictureFormOpen ? "block" : "none",
			backgroundColor: "rgba(100,100,100,0.7)"
		};

		return (
			<ModalWrapper handleClose={this.handleClose} isPicture={true} divStyle={divStyle}>
                <PictureForm ref="modalWrapper" handleClose={this.handleClose} />
            </ModalWrapper>
		);
	}
});

module.exports = PictureFormModal;
