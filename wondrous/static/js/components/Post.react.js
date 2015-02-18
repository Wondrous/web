var UserTitle = React.createClass({
    render: function () {
        return (<div>
                <img className="post-thumb round-50" src="/static/pictures/defaults/p.default-profile-picture.jpg"/>
                <span className="post-identifier ellipsis-overflow">
                    <a href={"/"+this.props.data.username}>{this.props.data.name}</a>
                </span></div>);
    }
});

var Photo = React.createClass({
    render: function () {

        photoStyle = {
            backgroundImage: this.props.data.ouuid?"url(http://mojorankdev.s3.amazonaws.com/"+this.props.data.ouuid+")" :"/static/pictures/500x500.gif"
        };

        return (
            <div className="post-cover-photo cover no-top-border"
            style={photoStyle}>
                <div className="post-subject-text">
                    <div className="post-subject-wrapper">
                        <div className="post-subject-text-position">
                            {this.props.data.subject}
                        </div>
                    </div>
                </div>
            </div>);
    }
});

var Post = React.createClass({
    render: function () {
        return (
            <div className="masonry-brick">
                <div className="post-body">
                    <input className="objectID" type="hidden" value={this.props.data.id} />
                    <UserTitle data={this.props.data} />
                    <Photo data={this.props.data}/>

                    <div className="post-content" style={{"display":"none"}}>
                    {this.props.data.text}
                        <hr style={{"width": "60%"}}/>
                        <div>
                            <span className="post-footer-btn post-like-btn round-2">Like!</span>
                            <span className="post-footer-btn post-repost-btn round-2">Repost</span>
                        </div>
                    </div>


                </div>
            </div>)
    }
});

module.exports = Post;
