var BoxStore = require('../../stores/BoxStore');

var Trending = React.createClass({
    mixins: [Reflux.listenTo(BoxStore, "onBoxChange")],

    componentDidMount: function() {
    },

    getInitialState: function() {
        return {tags: BoxStore.trending}
    },

    onBoxChange: function() {
        this.setState({tags: BoxStore.trending});
    },

    render: function() {
        var tags = this.state.tags.map(function(tag, ind) {
            return (
                <li className="trending-li" key={tag.tag_name}>
                    <Link className="hashtagify trending-a" to={'/tags/'+tag.tag_name}>
                        #{tag.tag_name}
                    </Link>
                </li>
            );
        });

        return (
            <ul className="trending-ul round-3">
                {tags}
            </ul>
        );
    }
});

module.exports = Trending;
