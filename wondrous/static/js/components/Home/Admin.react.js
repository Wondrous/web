var Feed = require('./Feed.react');
var UserStore = require('../../stores/UserStore');
var ModalStore = require('../../stores/ModalStore');
var LandingApp = require('../Landing.react');
var WondrousAPI = require('../../utils/WondrousAPI');

var Admin = React.createClass({
    mixins: [ Router.Navigation ],
    transition: function(){
        this.replaceWith('/');
    },
    componentDidMount: function(){
        WondrousAPI.admin_auth({
            callback: function(err,res){
                if(err!=null){
                    this.transition();
                }
            }
        });
    },

    render: function(){

        return (
            <div style={{paddingTop:"100px"}}>

            </div>
        );
    }
});

module.exports = Admin;
