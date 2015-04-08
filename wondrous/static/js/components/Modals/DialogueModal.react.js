var Dialogue = require('./Dialogue.react');
var ModalWrapper = require('./ModalWrapper.react');
var WondrousActions = require('../../actions/WondrousActions');
var ModalStore = require('../../stores/ModalStore');

var DialogueModal =  React.createClass({
    mixins:[Reflux.listenTo(ModalStore,"onModalChange")],
    onModalChange: function(stuff) {
        this.forceUpdate();
    },
    render: function(){
        divStyle = ModalStore.dialogueOpen?{display:"block"} : {display:"none"};
        return (
            <ModalWrapper handleClose={WondrousActions.cancelDialogue} divStyle={divStyle}>
                <Dialogue/>
            </ModalWrapper>
        );
    }
});

module.exports = DialogueModal;
