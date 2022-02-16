import React from 'react';
import PropTypes from 'prop-types';
import Post from './post';

class Posts extends React.Component {
  constructor(props) {
    super(props);
    this.state = { postList: [] };
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
          postList: data.results,
        });
      })
      .catch((error) => console.log(error));
  }

  render() {
    // This line automatically assigns this.state.imgUrl to the const variable imgUrl
    // and this.state.owner to the const variable owner
    const { postList } = this.state;
    // Render list of posts and TODO comments/likes
    return (
      <div className="posts">
        {postList.map((element) => <Post url={element.url} />)}
      </div>
    );
  }
}
Posts.propTypes = {
  url: PropTypes.string.isRequired,
};

export default Posts;
