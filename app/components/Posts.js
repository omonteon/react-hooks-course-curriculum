import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { fetchMainPosts } from '../utils/api';
import Loading from './Loading';
import PostsList from './PostsList';

function postsReducer(state, action) {
  switch (action.type) {
    case 'FETCH_POSTS_REQUEST':
      return {
        ...state,
        error: null,
        loading: true,
      };
    case 'FETCH_POSTS_SUCCESS':
      return {
        ...state,
        posts: action.posts,
        error: null,
        loading: false,
      };
    case 'FETCH_POSTS_FAILURE':
      return {
        ...state,
        posts: [],
        error: action.message,
        loading: false,
      };
    default:
      break;
  }
}

export default function Posts({ type }) {
  const [state, dispatch] = useReducer(postsReducer, {
    posts: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    handleFetch();
  }, [type]);

  function handleFetch() {
    dispatch({ type: 'FETCH_POSTS_REQUEST' });

    fetchMainPosts(type)
      .then((posts) => dispatch({ type: 'FETCH_POSTS_SUCCESS', posts }))
      .catch(({ message }) =>
        dispatch({ type: 'FETCH_POSTS_FAILURE', message })
      );
  }

  const { posts, error, loading } = state;

  if (loading === true) {
    return <Loading />;
  }

  if (error) {
    return <p className="center-text error">{error}</p>;
  }

  return <PostsList posts={posts} />;
}

Posts.propTypes = {
  type: PropTypes.oneOf(['top', 'new']),
};
