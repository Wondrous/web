var BoxStore = require('../../stores/BoxStore');

var Trending = React.createClass({
    mixins: [Reflux.listenTo(BoxStore,"onBoxChange")],
    componentDidMount: function(){
    },
    getInitialState: function(){
        return {tags:BoxStore.trending}
    },

    onBoxChange: function(){
        this.setState({tags:BoxStore.trending});
    },

    render: function(){
        var tags = this.state.tags.map(function(tag,ind){
            return (<li key={tag.tag_name}><Link to={'/tags/'+tag.tag_name}>{tag.tag_name} count: {tag.count}</Link></li>);
        });

        return (<ul style={{backgroundColor: "yellow"}}>
            {tags}
        </ul>);
    }
});


module.exports = Trending;
