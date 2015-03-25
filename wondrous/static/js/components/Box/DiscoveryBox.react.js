var Trending = require('./Trending.react');
var UserBox = require('./UserBox.react');

DiscoveryBox = React.createClass({

    render: function(){
        return (
        	<div>
                {/*
                <Trending/>
                <div style={{ height: 15 }}></div>
            	*/}
                <UserBox/>
            </div>
    	);
    }
});

module.exports = DiscoveryBox;
