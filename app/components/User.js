import React, { useEffect, useReducer } from 'react';
import queryString from 'query-string';
import { fetchUser, fetchPosts } from '../utils/api';
import Loading from './Loading';
import { formatDate } from '../utils/helpers';
import PostsList from './PostsList';

const actions = {
  FETCH_USER_SUCCESS: 'FETCH_USER_SUCCESS',
  FETCH_USER_FAILURE: 'FETCH_USER_FAILURE',
  FETCH_USER_POSTS_SUCCESS: 'FETCH_USER_POSTS_SUCCESS',
};

function userReducer(state, action) {
  switch (action.type) {
    case actions.FETCH_USER_SUCCESS:
      return {
        ...state,
        user: action.user,
        loadingUser: false,
        error: null,
      };
    case actions.FETCH_USER_POSTS_SUCCESS:
      return {
        ...state,
        posts: action.posts,
        loadingPosts: false,
        error: null,
      };
    case actions.FETCH_USER_FAILURE:
      return {
        ...state,
        error: action.message,
        loadingUser: false,
        loadingPosts: false,
      };
    default:
      break;
  }
}

const userInitialState = {
  user: null,
  loadingUser: true,
  posts: null,
  loadingPosts: true,
  error: null,
};

export default function User({ location }) {
  const [state, dispatch] = useReducer(userReducer, userInitialState);

  useEffect(() => {
    const { id } = queryString.parse(location.search);

    fetchUser(id)
      .then((user) => {
        dispatch({ type: actions.FETCH_USER_SUCCESS, user });

        return fetchPosts(user.submitted.slice(0, 30));
      })
      .then((posts) =>
        dispatch({ type: actions.FETCH_USER_POSTS_SUCCESS, posts })
      )
      .catch(({ message }) =>
        dispatch({ type: actions.FETCH_USER_FAILURE, message })
      );
  }, [id]);

  const { user, posts, loadingUser, loadingPosts, error } = state;

  if (error) {
    return <p className="center-text error">{error}</p>;
  }

  return (
    <React.Fragment>
      {loadingUser === true ? (
        <Loading text="Fetching User" />
      ) : (
        <React.Fragment>
          <h1 className="header">{user.id}</h1>
          <div className="meta-info-light">
            <span>
              joined <b>{formatDate(user.created)}</b>
            </span>
            <span>
              has <b>{user.karma.toLocaleString()}</b> karma
            </span>
          </div>
          <p dangerouslySetInnerHTML={{ __html: user.about }} />
        </React.Fragment>
      )}
      {loadingPosts === true ? (
        loadingUser === false && <Loading text="Fetching posts" />
      ) : (
        <React.Fragment>
          <h2>Posts</h2>
          <PostsList posts={posts} />
        </React.Fragment>
      )}
    </React.Fragment>
  );
}
