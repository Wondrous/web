var Dialogue = require('./Dialogue.react');
var ModalWrapper = require('./ModalWrapper.react');
var WondrousActions = require('../../actions/WondrousActions');
var ModalStore = require('../../stores/ModalStore');

var DialogueModal =  React.createClass({
    mixins:[Reflux.listenTo(ModalStore,"onModalChange")],
    
    onModalChange: function(stuff) {
        this.forceUpdate();
    },

    render: function() {
        divStyle = {
            display: ModalStore.dialogueOpen ? "block" : "none",
            backgroundColor: "rgba(55,55,55,0.75)",
        };
        
        return (
            <ModalWrapper handleClose={WondrousActions.cancelDialogue} divStyle={divStyle}>
                <Dialogue/>
            </ModalWrapper>
        );
    }
});

module.exports = DialogueModal;
