import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function getStaticProps() {
  const { data: posts } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
  return { props: { posts } };
}

export default function Home({ posts: initialPosts }) {
  const [posts, setPosts] = useState(initialPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Refresh posts (in case of likes/comments updates)
  async function refreshPosts() {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    setPosts(data);
  }

  return (
    <div className="container mx-auto p-4">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome to WhisperSpace</h1>
      </header>

      <div className="flex justify-center mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition"
        >
          + New Post
        </button>
      </div>

      <ul className="space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} refreshPosts={refreshPosts} />)
        ) : (
          <p className="text-gray-500 text-center">No posts yet. Be the first to share your thoughts!</p>
        )}
      </ul>

      {/* New Post Modal */}
      {isModalOpen && <NewPostModal closeModal={() => setIsModalOpen(false)} refreshPosts={refreshPosts} />}
    </div>
  );
}

function PostCard({ post, refreshPosts }) {
  const [likes, setLikes] = useState(post.likes || 0);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  async function handleLike() {
    const { data, error } = await supabase.from('posts').update({ likes: likes + 1 }).eq('id', post.id);
    if (!error) {
      setLikes(likes + 1);
      refreshPosts();
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800">{post.title}</h2>
      <p className="text-gray-600 mt-2">{post.content}</p>
      <p className="text-sm text-gray-500 mt-4">— {post.username || 'Anonymous'}</p>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handleLike}
          className="text-indigo-600 hover:text-indigo-800 transition"
        >
          👍 {likes} Likes
        </button>
        <button
          onClick={() => setIsCommentModalOpen(true)}
          className="text-gray-600 hover:text-gray-800 transition"
        >
          💬 Comments
        </button>
      </div>

      {/* Comment Modal */}
      {isCommentModalOpen && (
        <CommentModal postId={post.id} onClose={() => setIsCommentModalOpen(false)} />
      )}
    </div>
  );
}

function NewPostModal({ closeModal, refreshPosts }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [username, setUsername] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    await supabase.from('posts').insert([{ title, content, username }]);
    refreshPosts();
    closeModal();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Create a New Post</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="block w-full p-3 border border-gray-300 rounded-md mb-4"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="block w-full p-3 border border-gray-300 rounded-md mb-4"
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
          <input
            className="block w-full p-3 border border-gray-300 rounded-md mb-4"
            placeholder="Username (optional)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              onClick={closeModal}
              className="mr-4 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CommentModal({ postId, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    async function fetchComments() {
      const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      setComments(data || []);
    }
    fetchComments();
  }, [postId]);

  async function handleAddComment(e) {
    e.preventDefault();
    await supabase.from('comments').insert([
      { post_id: postId, content: newComment, username: username || 'Anonymous' },
    ]);
    setComments((prev) => [...prev, { username: username || 'Anonymous', content: newComment }]);
    setNewComment('');
    setUsername('');
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Comments</h2>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {comments.map((comment, idx) => (
            <div key={idx} className="p-2 border-b border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>{comment.username || 'Anonymous'}:</strong> {comment.content}
              </p>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddComment} className="mt-4">
          <textarea
            className="block w-full p-3 border border-gray-300 rounded-md mb-4"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
          ></textarea>
          <input
            className="block w-full p-3 border border-gray-300 rounded-md mb-4"
            placeholder="Comment as (optional)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="mr-4 text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition"
            >
              Add Comment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

