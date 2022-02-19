import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

class Post extends React.Component {
  /* Display number of image and post owner of a single post */

  constructor(props) {
    // Initialize mutable state
    super(props);
    this.state = {
      imgUrl: '', owner: '', comments: [], likes: 0, isLiked: false, ownerImgUrl: '', ownerShowUrl: '', postShowUrl: '', created: '', postid: 0, likeurl: '', text: '', commentid: '',
    };
    this.handleLike = this.handleLike.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleDeleteComment = this.handleDeleteComment.bind(this);
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
          likes: data.likes.numLikes,
          isLiked: data.likes.lognameLikesThis,
          ownerImgUrl: data.ownerImgUrl,
          ownerShowUrl: data.ownerShowUrl,
          postShowUrl: data.postShowUrl,
          created: data.created,
          postid: data.postid,
          likeurl: data.likes.url,
        });
      })
      .catch((error) => console.log(error));
  }

  handleLike() {
    var postid = this.state.postid;
    if (!this.state.isLiked) {
      const requestOptions = {
        method: 'POST'
      }
      fetch("/api/v1/likes/?postid=" + postid, requestOptions)
        .then((response) => {
          if (!response.ok) throw Error(response.statusText);
          return response.json();
        })
        .then((data) => {
          this.setState((prevState) => ({
            isLiked: !prevState.isLiked,
            likes: prevState.likes + 1,
            likeurl: data.url,
          }));
        })
    }
    else {
      const requestOptions = {
        method: 'DELETE'
      }
      fetch(this.state.likeurl, requestOptions)
        .then(() => {
          this.setState((prevState) => ({
            isLiked: !prevState.isLiked,
            likes: prevState.likes - 1,
          }));
        })

    }

  }
  handleDoubleClick() {
    var postid = this.state.postid;
    if (!this.state.isLiked) {
      const requestOptions = {
        method: 'POST'
      }
      fetch("/api/v1/likes/?postid=" + postid, requestOptions)
        .then((response) => {
          if (!response.ok) throw Error(response.statusText);
          return response.json();
        })
        .then((data) => {
          this.setState((prevState) => ({
            isLiked: !prevState.isLiked,
            likes: prevState.likes + 1,
            likeurl: data.url,
          }));
        })
    }
  }
  handleSubmit = e => {
    e.preventDefault();
    var postid = this.state.postid;
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: this.state.text })
    }
    fetch("/api/v1/comments/?postid=" + postid, requestOptions)
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        this.setState((prevState) => ({
          comments: prevState.comments.concat([{
            commentid: data.commentid,
            owner: data.owner,
            ownerShowUrl: data.ownerShowUrl,
            text: data.text,
            lognameOwnsThis: data.lognameOwnsthis,
            url: data.url,
          }]),
          text: ''
        }));
      })
  }
  handleChange(event) {
    this.setState({ text: event.target.value })
  }

  handleDeleteComment(commentid) {
    const requestOptions = {
      method: 'DELETE',
    }
    fetch("/api/v1/comments/" + commentid + "/", requestOptions)
      .then(() => {
        this.setState((prevState) => ({
          comments: this.arrayRemove(prevState.comments, commentid)
        }));
      })

  }

  arrayRemove(arr, value) {
    return arr.filter(function (ele) {
      return ele.commentid != value
    });
  }

  render() {
    // This line automatically assigns this.state.imgUrl to the const variable imgUrl
    // and this.state.owner to the const variable owner
    const {
      imgUrl, owner, comments, likes, ownerImgUrl, ownerShowUrl, postShowUrl, created, postid, likeurl, text, commentid
    } = this.state;
    // Render number of post image and post owner
    const commentList = [];
    let comment_index = 0
    for (let i = 0; i < comments.length; i += 1) {
      const actualComment = {};
      actualComment.owner = comments[i].owner;
      actualComment.ownerShowUrl = comments[i].ownerShowUrl;
      actualComment.text = comments[i].text;
      actualComment.commentid = comments[i].commentid;
      if (comments[i].lognameOwnsThis) {
        // console.log(comments[i].commentid)
        actualComment.button = <button className="delete-comment-button" type="button" onClick={() => this.handleDeleteComment(actualComment.commentid)}> Delete comment </button>;
      } else {
        actualComment.button = <p />;
      }
      commentList.push(actualComment);
    }
    const timestamp = moment.utc(created).fromNow();
    return (
      <div className="post">
        <img src={imgUrl} alt="pic" onDoubleClick={this.handleDoubleClick} />
        <a href={ownerShowUrl}>
          {owner}
          <img src={ownerImgUrl} height="30" alt="pfp" />
        </a>
        <a href={postShowUrl}>
          {timestamp}
        </a>
        <p>
          {likes} likes
          <button className="like-unlike-button" type="button" onClick={this.handleLike}>
            {this.state.isLiked ? 'unlike' : 'like'}
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
        <form className="comment-form" onSubmit={this.handleSubmit}>
          <input type="text" value={this.state.text} onChange={this.handleChange} />

        </form>
      </div>
    );
  }
}

Post.propTypes = {
  url: PropTypes.string.isRequired,
};

export default Post;
