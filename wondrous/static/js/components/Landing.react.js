var Post = require('./post.react');
var WondrousAPI = require('../utils/WondrousAPI');

var sample_posts =
    {
        created_at: "2015-02-21T22:09:43.705031",
        id: 27,
        is_active: true,
        is_hidden: false,
        mime_type: "image/jpeg",
        name: "Pizza Man",
        object_id: 31,
        original_id: null,
        ouuid: "31-1a2c20f7-cc69-41e0-932c-5e0ea15f35e3",
        owner_id: null,
        repost_id: null,
        set_to_delete: null,
        subject: "flower",
        text: "flower",
        user_id: 1,
        user_ouuid: "30-876a34a9-8ffd-4b4a-9acb-dc2125fcc205",
        username: "60shades"
    };


var SignedUp = React.createClass({
    render: function(){
        return (
            <div>
                <h3>Thank you, {this.props.data.email}</h3>
                <p>You have referred {this.props.data.referred} people!</p>
                <p>Your reference: </p>
                <input type="text" value={"https://wondrous.co/refer/" +this.props.data.uuid}/>
            </div>
        );
    }
});

var LandingApp = React.createClass({
    registered:false,
    referrer_info:{},
    mixins: [Router.State],
    handleData:function(err,res){
        if(err==null){
            this.registered = true;
            this.referrer_info = res;
            this.forceUpdate();
        }else{

        }
    },
    handleClick: function(){
        var ref_uuid = this.getParams().ref_uuid;
        if (typeof ref_uuid==='undefined'){
            ref_uuid = null;
        }

        WondrousAPI.registerReferrer({
            callback:this.handleData,
            email:this.refs.email.getDOMNode().value,
            ref_uuid:ref_uuid
        })
    },
    render: function(){

        return (
            <div>
                <section>
                    <h1>$omething Wondrou$ i$ happening</h1>
                    {!this.registered?
                        <div>
                        <h3>"There's 500000000 people waiting, join them and help us get $1,000,000,000 in funding"</h3>
                        <input ref="email" type="email"/> <button onClick={this.handleClick}>$ign up</button></div>:
                        <SignedUp data={this.referrer_info}/>}

                </section>
                <hr/>
                <section>
                    <div className="masonry">
                        <Post data={sample_posts}/>
                        <Post data={sample_posts}/>
                        <Post data={sample_posts}/>
                    </div>
                </section>
                <hr/>
                <section>
                    <div>
                        <h1> FEATURES </h1>
                        <p>blah blah blah</p>
                    </div>
                </section>
                <section>

                </section>
            </div>
        );
    }
});

module.exports = LandingApp;
