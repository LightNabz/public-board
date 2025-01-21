import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Head from 'next/head';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function getStaticProps() {
  const { data: posts } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
  return { props: { posts } };
}

export default function Admin({ posts: initialPosts }) {
  const [posts, setPosts] = useState(initialPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  // Handle password submission for authentication
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  // Refresh posts (in case of likes/comments updates)
  async function refreshPosts() {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    setPosts(data);
  }

  // Handle post deletion
  async function handleDelete(postId) {
    await supabase.from('posts').delete().eq('id', postId);
    refreshPosts(); // Refresh the list of posts after deletion
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4">
        <Head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Admin Panel - Nabz Board</title>
          <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&display=swap" rel="stylesheet" />
        </Head>

        <div className="flex justify-center items-center h-screen">
          <form onSubmit={handlePasswordSubmit} className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Enter Admin Password</h2>
            <input
              type="password"
              className="block w-full p-3 border border-gray-300 rounded-md mb-4"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4" style={{ marginTop: '80px' }}>
      <Head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Admin Panel - Nabz Board</title>
        <script src="https://cdn.jsdelivr.net/npm/heroicons@2.0.16/24/outline.js"></script>
        <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>

      <nav>
        <div className="logo">Admin Panel</div>
        <header>
          <ul id="nav-links">
            <li><a href="/">Beranda</a></li>
            <li><a href="#about">Tentang</a></li>
            <li><a href="#projects">Hasil nganggur</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </header>
      </nav>

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
          posts.map((post) => (
            <PostCard key={post.id} post={post} refreshPosts={refreshPosts} handleDelete={handleDelete} />
          ))
        ) : (
          <p className="text-gray-500 text-center">No posts yet. Be the first to share your thoughts!</p>
        )}
      </ul>

      {/* New Post Modal */}
      {isModalOpen && <NewPostModal closeModal={() => setIsModalOpen(false)} refreshPosts={refreshPosts} />}
    </div>
  );
}

function PostCard({ post, refreshPosts, handleDelete }) {
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
      <p className="text-sm text-gray-500 mt-4">by: {post.username || 'Admin'}</p>

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
        {/* Delete button */}
        <button
          onClick={() => handleDelete(post.id)}
          className="text-red-600 hover:text-red-800 transition"
        >
          🗑️ Delete
        </button>
      </div>

      {/* Comment Modal */}
      {isCommentModalOpen && (
        <CommentModal postId={post.id} onClose={() => setIsCommentModalOpen(false)} />
      )}
    </div>
  );
}

function CommentModal({ postId, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    async function fetchComments() {
      const { data } = await supabase.from('comments').select('*').eq('post_id', postId);
      setComments(data);
    }
    fetchComments();
  }, [postId]);

  async function handleCommentSubmit(e) {
    e.preventDefault();
    await supabase.from('comments').insert([{ post_id: postId, content: newComment, username }]);
    setNewComment('');
    onClose();
  }

  async function handleDeleteComment(commentId) {
    await supabase.from('comments').delete().eq('id', commentId);
    setComments(comments.filter((comment) => comment.id !== commentId)); // Remove comment from state
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Comments</h2>

        {/* Scrollable Comments Section */}
        <div className="space-y-4 max-h-64 overflow-y-auto border-b border-gray-200 pb-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="p-4 border-b border-gray-200">
                <p className="text-gray-600">{comment.content}</p>
                <p className="text-sm text-gray-500">— {comment.username || 'Anonymous'}</p>

                {/* Delete button for each comment */}
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-red-600 hover:text-red-800 text-sm mt-2"
                >
                  🗑️ Delete
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          )}
        </div>

        {/* New Comment Form */}
        <form onSubmit={handleCommentSubmit} className="mt-4">
          <textarea
            className="block w-full p-3 border border-gray-300 rounded-md mb-4"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          ></textarea>
          <input
            className="block w-full p-3 border border-gray-300 rounded-md mb-4"
            placeholder="Username (optional)"
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
              Submit
              </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NewPostModal({ closeModal, refreshPosts }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [username, setUsername] = useState('');

  async function handleNewPostSubmit(e) {
    e.preventDefault();
    await supabase.from('posts').insert([{ title, content, username }]);
    closeModal();
    refreshPosts();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Post</h2>
        <form onSubmit={handleNewPostSubmit}>
          <input
            className="w-full p-3 border border-gray-300 rounded-md mb-4"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md mb-4"
            placeholder="Post content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <input
            className="w-full p-3 border border-gray-300 rounded-md mb-4"
            placeholder="Your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition w-full"
          >
            Submit Post
          </button>
        </form>
        <button
          onClick={closeModal}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        >
          ✖️ Close
        </button>
      </div>
    </div>
  );
}
