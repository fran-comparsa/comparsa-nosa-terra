import { useState, useEffect } from 'react';
import { api } from '../App';
import { Heart, MessageCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Post({ post, currentUser, onDelete }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    setLiked(post.likes?.includes(currentUser.id) || false);
    // Cargar el conteo de comentarios al inicio
    loadCommentsCount();
  }, [post.likes, currentUser.id]);

  const loadCommentsCount = async () => {
    try {
      const response = await api.get(`/posts/${post.id}/comments`);
      setCommentsCount(response.data.length);
    } catch (error) {
      console.error('Error al cargar conteo de comentarios');
    }
  };

  const handleLike = async () => {
    try {
      const response = await api.post(`/posts/${post.id}/like`);
      setLikesCount(response.data.likes);
      setLiked(!liked);
    } catch (error) {
      toast.error('Error al dar me gusta');
    }
  };

  const fetchComments = async () => {
    if (comments.length > 0) {
      setShowComments(!showComments);
      return;
    }

    setLoadingComments(true);
    try {
      const response = await api.get(`/posts/${post.id}/comments`);
      setComments(response.data);
      setShowComments(true);
    } catch (error) {
      toast.error('Error al cargar comentarios');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await api.post(`/posts/${post.id}/comments`, { content: newComment });
      setComments([...comments, response.data]);
      setCommentsCount(commentsCount + 1);
      setNewComment('');
      toast.success('Comentario agregado');
    } catch (error) {
      toast.error('Error al agregar comentario');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('¿Eliminar este comentario?')) return;

    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
      setCommentsCount(commentsCount - 1);
      toast.success('Comentario eliminado');
    } catch (error) {
      toast.error('Error al eliminar comentario');
    }
  };

  const canDelete = currentUser.id === post.user_id || currentUser.role === 'admin';

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: es });
    } catch {
      return 'Hace un momento';
    }
  };

  return (
    <div className="post" data-testid={`post-${post.id}`}>
      <div className="post-header">
        <div className="post-avatar" data-testid="post-avatar">
          {post.user_avatar ? (
            <img src={post.user_avatar} alt={post.user_name} className="w-full h-full object-cover" />
          ) : (
            getInitials(post.user_name)
          )}
        </div>
        <div className="post-author">
          <div className="post-author-name" data-testid="post-author-name">{post.user_name}</div>
          <div className="post-time" data-testid="post-time">{formatDate(post.created_at)}</div>
        </div>
        {canDelete && (
          <button
            onClick={() => onDelete(post.id)}
            className="text-gray-400 hover:text-red-500 transition"
            data-testid="delete-post-button"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      <div className="post-content" data-testid="post-content">
        {post.content}
      </div>

      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post"
          className="post-image"
          data-testid="post-image"
        />
      )}

      <div className="post-actions">
        <button
          onClick={handleLike}
          className={`post-action-btn ${liked ? 'liked' : ''}`}
          data-testid="like-button"
        >
          <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
          <span>{likesCount > 0 && likesCount}</span>
          Me gusta
        </button>

        <button
          onClick={fetchComments}
          className="post-action-btn"
          data-testid="comment-button"
        >
          <MessageCircle size={20} />
          <span>{commentsCount > 0 && `(${commentsCount})`}</span>
          Comentar
        </button>
      </div>

      {showComments && (
        <div className="comments-section" data-testid="comments-section">
          {loadingComments ? (
            <div className="text-center text-gray-500 py-4">Cargando comentarios...</div>
          ) : (
            <>
              {comments.map((comment) => {
                const canDeleteComment = currentUser.id === comment.user_id || currentUser.role === 'admin';
                return (
                  <div key={comment.id} className="comment" data-testid={`comment-${comment.id}`}>
                    <div className="comment-avatar">
                      {comment.user_avatar ? (
                        <img src={comment.user_avatar} alt={comment.user_name} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(comment.user_name)
                      )}
                    </div>
                    <div className="comment-content" style={{ position: 'relative' }}>
                      <div className="comment-author" data-testid="comment-author">{comment.user_name}</div>
                      <div className="comment-text" data-testid="comment-text">{comment.content}</div>
                      {canDeleteComment && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-xs text-gray-400 hover:text-red-500 mt-1"
                          data-testid="delete-comment-button"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              <form onSubmit={handleComment} className="mt-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="form-input flex-1"
                    placeholder="Escribe un comentario..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    data-testid="new-comment-input"
                  />
                  <button type="submit" className="btn btn-primary" data-testid="submit-comment-button">
                    Enviar
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}