import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

class Post extends React.Component {
  /* Display number of image and post owner of a single post */

  constructor(props) {
    // Initialize mutable state
    super(props);
    this.state = {
      imgUrl: '', owner: '', comments: [], likes: {}, isLiked: false, ownerImgUrl: '', ownerShowUrl: '', postShowUrl: '', created: '',
    };
    this.handleLike = this.handleLike.bind(this);
  }

  componentDidMount() {
    // This line automatically assigns this.props.url to the const variable url
    const { url } = this.props;

    // Call REST API to get the post's information
    fetch(url, { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        this.setState({
          imgUrl: data.imgUrl,
          owner: data.owner,
          comments: data.comments,
          likes: data.likes,
          isLiked: data.likes.lognameLikesThis,
          ownerImgUrl: data.ownerImgUrl,
          ownerShowUrl: data.ownerShowUrl,
          postShowUrl: data.postShowUrl,
          created: data.created,
        });
      })
      .catch((error) => console.log(error));
  }

  handleLike() {
    this.setState((prevState) => ({
      isLiked: !prevState.isLiked,
    }));
  }

  render() {
    // This line automatically assigns this.state.imgUrl to the const variable imgUrl
    // and this.state.owner to the const variable owner
    const {
      imgUrl, owner, comments, likes, ownerImgUrl, ownerShowUrl, postShowUrl, created,
    } = this.state;

    // Render number of post image and post owner
    const commentList = [];
    for (let i = 0; i < comments.length; i += 1) {
      const actualComment = {};
      actualComment.owner = comments[i].owner;
      actualComment.ownerShowUrl = comments[i].ownerShowUrl;
      actualComment.text = comments[i].text;
      if (comments[i].lognameOwnsThis) {
        actualComment.button = <button className="delete-comment-button" type="button"> remove </button>;
      } else {
        actualComment.button = <p />;
      }
      commentList.push(actualComment);
    }
    const timestamp = moment.utc(created).fromNow();
    // const timestamp = moment(created + "-05:00", "YYYY-MM-DD HH:mm:ss").fromNow();
    return (
      <div className="post">
        <a href={postShowUrl}>
          <img src={imgUrl} alt="pic" />
        </a>
        <a href={ownerShowUrl}>
          {owner}
          <img src={ownerImgUrl} height="30" alt="pfp" />
        </a>
        <a href={postShowUrl}>
          {timestamp}
        </a>
        <p>
          {likes.numLikes}
          likes
          <button className="like-unlike-button" type="button" onClick={this.handleLike}>
            {this.state.isLiked ? 'like' : 'unlike'}
          </button>
        </p>
        {commentList.map(
          (comment) => (
            <p>
              <a href={comment.ownerShowUrl}>{comment.owner}</a>
              {comment.text}
              {comment.button}
            </p>
          ),
        )}
      </div>
    );
  }
}

Post.propTypes = {
  url: PropTypes.string.isRequired,
};

export default Post;
