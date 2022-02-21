import React from 'react';
import PropTypes from 'prop-types';
import Post from './post';
import InfiniteScroll from 'react-infinite-scroll-component';

class Posts extends React.Component {
  constructor(props) {
    super(props);
    this.state = { postList: [], nextUrl: '' };
    this.fetchData = this.fetchData.bind(this)
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
          nextUrl: data.next,
        });
      })
      .catch((error) => console.log(error));
  }

  fetchData() {
    const requestOptions = {
      method: 'GET'
    }
    fetch(this.state.nextUrl, requestOptions)
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        this.setState((prevState) => ({
          postList: prevState.postList.concat(data.results),
          nextUrl: data.next,
        }));
      })
      .catch((error) => console.log(error));
  }

  isMore() {
    return this.state.next != "";
  }


  render() {
    // This line automatically assigns this.state.imgUrl to the const variable imgUrl
    // and this.state.owner to the const variable owner
    const { postList, nextUrl } = this.state;
    // Render list of posts and TODO comments/likes
    return (

      <div className="posts">
        <InfiniteScroll
          dataLength={postList.length} //This is important field to render the next data
          next={this.fetchData}
          hasMore={this.isMore}
          loader={<h4>Loading...</h4>}
          endMessage={
            <p style={{ textAlign: 'center' }}>
              <b>Yay! You have seen it all</b>
            </p>
          }
        >
          {postList.map((element) =>
            <div key={element.postid}>
              <Post url={element.url} />
            </div>)}
        </InfiniteScroll>
      </div>
    );
  }
}
Posts.propTypes = {
  url: PropTypes.string.isRequired,
};

export default Posts;