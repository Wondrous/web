var WondrousActions = require('../../actions/WondrousActions');
var ModalStore = require('../../stores/ModalStore');
var UserStore = require('../../stores/UserStore');
var WondrousConstants = require('../../constants/WondrousConstants');
var PostForm = require('./PostForm.react');
var ModalWrapper = require('./ModalWrapper.react');

var PostFormModal = React.createClass({
	mixins:[
        Reflux.connect(ModalStore)
    ],
	getInitialState: function(){
		return {postFormOpen:false}
	},

	componentDidMount: function(){
		var con = $(this.refs.modalWrapper.getDOMNode());
		con.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',function(){
			$(this).removeClass("animated bounceInDown");
		});
	},

	handleClose: function(evt) {
		var con = $(this.refs.modalWrapper.getDOMNode());
		WondrousActions.closePostModal();

		if(typeof evt!=='undefined'){
			evt.preventDefault();
			evt.stopPropagation();
		}
	},

	componentDidUpdate: function(){
		if (this.state.postFormOpen){
			var con = $(this.refs.modalWrapper.getDOMNode());
			if(this.state.dialogueOpen!=true){
				con.addClass("animated bounceInDown");
			}
		}
	},

	render: function() {

		divStyle = {
			display: this.state.postFormOpen ? "block" : "none",
			backgroundColor: "rgba(100,100,100,0.7)"
		};

		return (
			<ModalWrapper handleClose={this.handleClose} divStyle={divStyle}>
                <PostForm ref="modalWrapper" />
            </ModalWrapper>
		);
	}
});



module.exports = PostFormModal;
