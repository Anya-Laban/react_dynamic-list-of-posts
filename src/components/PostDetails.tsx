import React, { useEffect, useState } from 'react';
import { Loader } from './Loader';
import { NewCommentForm } from './NewCommentForm';
import { Post } from '../types/Post';
import { Comment, CommentData } from '../types/Comment';
import * as commentService from '../api/comments';
import classNames from 'classnames';

type Props = {
  post: Post;
};

export const PostDetails: React.FC<Props> = ({ post }) => {
  const [comments, setComments] = useState<Comment[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null,
  );
  const [hasError, setHasError] = useState(false);
  const [hasWarning, setHasWarning] = useState(false);
  const [isFormActive, setIsFormActive] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setHasWarning(false);
    setIsFormActive(false);

    commentService
      .getComments(post.id)
      .then(commentsFromServer => {
        if (commentsFromServer.length === 0) {
          setHasWarning(true);
          setComments([]);
        } else {
          setComments(commentsFromServer);
        }
      })
      .catch(() => setHasError(true))
      .finally(() => {
        setIsLoading(false);
      });
  }, [post]);

  const handleDeleteComment = (commentId: number) => {
    setHasError(false);
    setDeletingCommentId(commentId);

    commentService
      .deleteComment(commentId)
      .then(() => {
        setComments(currentComments =>
          currentComments.filter(comment => comment.id !== commentId),
        );
      })
      .catch(() => setHasError(true))
      .finally(() => {
        if (comments.length <= 1) {
          setHasWarning(true);
        }

        setDeletingCommentId(null);
      });
  };

  const addNewComment = (newCommentData: CommentData) => {
    return commentService
      .postComment({ postId: post.id, ...newCommentData })
      .then(newComment => {
        setHasWarning(false);
        setComments(curComments => [...curComments, newComment]);
      })
      .catch(error => {
        throw error;
      });
  };

  return (
    <div className="content" data-cy="PostDetails">
      <div className="content" data-cy="PostDetails">
        <div className="block">
          <h2 data-cy="PostTitle">
            #{post.id}: {post.title}
          </h2>

          <p data-cy="PostBody">{post.body}</p>
        </div>

        <div className="block">
          {isLoading && <Loader />}

          {hasError && (
            <div className="notification is-danger" data-cy="CommentsError">
              Something went wrong
            </div>
          )}

          {hasWarning && (
            <p className="title is-4" data-cy="NoCommentsMessage">
              No comments yet
            </p>
          )}

          {comments.length > 0 && (
            <>
              <p className="title is-4">Comments:</p>

              {comments.map(comment => (
                <article
                  key={comment.id}
                  className="message is-small"
                  data-cy="Comment"
                >
                  <div className="message-header">
                    <a href={`mailto:${comment.email}`} data-cy="CommentAuthor">
                      {comment.name}
                    </a>
                    <button
                      data-cy="CommentDelete"
                      type="button"
                      className={classNames('button delete is-small', {
                        'is-loading': deletingCommentId === comment.id,
                      })}
                      aria-label="delete"
                      onClick={() => handleDeleteComment(comment.id)}
                    ></button>
                  </div>

                  <div className="message-body" data-cy="CommentBody">
                    {comment.body}
                  </div>
                </article>
              ))}
            </>
          )}

          {!isLoading && !hasError && !isFormActive && (
            <button
              data-cy="WriteCommentButton"
              type="button"
              className="button is-link"
              onClick={() => setIsFormActive(true)}
            >
              Write a comment
            </button>
          )}
        </div>

        {isFormActive && <NewCommentForm onAddComment={addNewComment} />}
      </div>
    </div>
  );
};
