import React, { useEffect, useReducer } from 'react';
import queryString from 'query-string';
import { fetchItem, fetchComments } from '../utils/api';
import Loading from './Loading';
import PostMetaInfo from './PostMetaInfo';
import Title from './Title';
import Comment from './Comment';

const actions = {
  FETCH_POST_SUCCESS: 'FETCH_POST_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
  FETCH_COMMENTS_SUCCESS: 'FETCH_COMMENTS_SUCCESS',
};

function postReducer(state, action) {
  switch (action.type) {
    case actions.FETCH_POST_SUCCESS:
      return {
        ...state,
        post: action.post,
        loadingPost: false,
        error: null,
      };
    case actions.FETCH_COMMENTS_SUCCESS:
      return {
        ...state,
        comments: action.comments,
        loadingComments: false,
        error: null,
      };
    case actions.FETCH_FAILURE:
      return {
        ...state,
        error: action.message,
        loadingComments: false,
        loadingPost: false,
      };
    default:
      break;
  }
}

const postInitialState = {
  post: null,
  loadingPost: true,
  comments: null,
  loadingComments: true,
  error: null,
};

export default function Post({ location }) {
  const [state, dispatch] = useReducer(postReducer, postInitialState);

  useEffect(() => {
    const { id } = queryString.parse(location.search);

    fetchItem(id)
      .then((post) => {
        dispatch({ type: actions.FETCH_POST_SUCCESS, post });

        return fetchComments(post.kids || []);
      })
      .then((comments) =>
        dispatch({ type: actions.FETCH_COMMENTS_SUCCESS, comments })
      )
      .catch(({ message }) =>
        dispatch({ type: actions.FETCH_FAILURE, message })
      );
  }, [id]);

  const { post, loadingPost, comments, loadingComments, error } = state;

  if (error) {
    return <p className="center-text error">{error}</p>;
  }

  return (
    <React.Fragment>
      {loadingPost === true ? (
        <Loading text="Fetching post" />
      ) : (
        <React.Fragment>
          <h1 className="header">
            <Title url={post.url} title={post.title} id={post.id} />
          </h1>
          <PostMetaInfo
            by={post.by}
            time={post.time}
            id={post.id}
            descendants={post.descendants}
          />
          <p dangerouslySetInnerHTML={{ __html: post.text }} />
        </React.Fragment>
      )}
      {loadingComments === true ? (
        loadingPost === false && <Loading text="Fetching comments" />
      ) : (
        <React.Fragment>
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </React.Fragment>
      )}
    </React.Fragment>
  );
}
