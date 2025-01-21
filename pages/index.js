import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Head from 'next/head'; // Import Head for meta tags

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function getStaticProps() {
  const { data: posts } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
  return { props: { posts } };
}

export default function Home({ posts: initialPosts }) {
  const [posts, setPosts] = useState(initialPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  // Refresh posts (in case of likes/comments updates)
  async function refreshPosts() {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    setPosts(data);
  }

  function toggleMenu() {
    setIsMenuOpen(!isMenuOpen);
  }

  useEffect(() => {
    refreshPosts();
  }, []);

  return (
    <div className="container mx-auto p-4" style={{ marginTop: '80px' }}>
      <Head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Nabz githap</title>
        <script src="https://cdn.jsdelivr.net/npm/heroicons@2.0.16/24/outline.js"></script>
        <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>

      <nav>
        <div className="logo">Public Board</div>
        <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <header>
          <ul className={isMenuOpen ? 'active' : ''} id="nav-links">
            <li><a href="https://lightnabz.vercel.app">Beranda</a></li>
            <li><a href="https://lightnabz.vercel.app/#about">Tentang</a></li>
            <li><a href="https://lightnabz.vercel.app/#projects">Hasil nganggur</a></li>
            <li><a href="https://lightnabz.vercel.app/#contact">Contact</a></li>
            <li>
              <a href="https://github.com/LightNabz" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.11.793-.26.793-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.807 1.305 3.495.998.108-.775.419-1.305.762-1.605-2.665-.306-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.123-.304-.535-1.524.117-3.176 0 0 1.007-.322 3.301 1.23a11.52 11.52 0 013.004-.404c1.02.004 2.047.137 3.003.403 2.292-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.12 3.177.77.84 1.232 1.91 1.232 3.22 0 4.609-2.805 5.619-5.475 5.92.429.37.823 1.103.823 2.222 0 1.605-.014 2.896-.014 3.287 0 .32.19.694.8.576 4.765-1.592 8.2-6.09 8.2-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </li>
          </ul>
        </header>
      </nav>

      <div className="background">
        <div className="circle" style={{ top: '90%', left: '10%', animationDuration: '12s' }}></div>
        <div className="circle" style={{ top: '85%', left: '50%', animationDuration: '15s' }}></div>
        <div className="circle" style={{ top: '95%', left: '30%', animationDuration: '10s' }}></div>
        <div className="circle" style={{ top: '80%', left: '70%', animationDuration: '18s' }}></div>
        <div className="circle" style={{ top: '90%', left: '90%', animationDuration: '16s' }}></div>
        <div className="circle" style={{ top: '85%', left: '20%', animationDuration: '11s' }}></div>
        <div className="circle" style={{ top: '75%', left: '40%', animationDuration: '9s' }}></div>
        <div className="circle" style={{ top: '70%', left: '60%', animationDuration: '13s' }}></div>
        <div className="circle" style={{ top: '95%', left: '80%', animationDuration: '14s' }}></div>
        <div className="circle" style={{ top: '88%', left: '15%', animationDuration: '12s' }}></div>
      </div>

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
  const [commentCount, setCommentCount] = useState(0); // Track the comment count
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  useEffect(() => {
    async function fetchCommentCount() {
      const { count } = await supabase
        .from('comments')
        .select('id', { count: 'exact' })
        .eq('post_id', post.id);
      setCommentCount(count); // Set the number of comments
    }
    fetchCommentCount();
  }, [post.id]);

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
      <p className="text-sm text-gray-500 mt-4">by: {post.username || 'Anonymous'}</p>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handleLike}
          className="text-indigo-600 hover:text-indigo-800 transition"
        >
          ❤️ {likes} Likes
        </button>
        <button
          onClick={() => setIsCommentModalOpen(true)}
          className="text-gray-600 hover:text-gray-800 transition"
        >
          💬 {commentCount} Comments
        </button>
      </div>

      {/* Comment Modal */}
      {isCommentModalOpen && (
        <CommentsModal postId={post.id} onClose={() => setIsCommentModalOpen(false)} />
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

function CommentsModal({ postId, onClose }) {
  const [newComment, setNewComment] = useState('');
  const [username, setUsername] = useState('Anonymous'); // Default username
  const [comments, setComments] = useState([]);

  useEffect(() => {
    // Fetch initial comments
    const fetchComments = async () => {
      const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      setComments(data || []);
    };

    fetchComments();

    // Realtime updates
    const subscription = supabase
      .channel('realtime:comments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        (payload) => {
          if (payload.new.post_id === postId) {
            // If comment is new, add it to the state
            setComments((prevComments) => {
              // Prevent duplicates by ensuring the new comment isn't already in the list
              if (!prevComments.some(comment => comment.id === payload.new.id)) {
                return [...prevComments, payload.new];
              }
              return prevComments;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [postId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      const newCommentObj = {
        post_id: postId,
        content: newComment,
        username: username.trim() || 'Anonymous',
        created_at: new Date().toISOString(),
      };
  
      // Optimistically update the UI
      setComments((prevComments) => [newCommentObj, ...prevComments]);
  
      try {
        // Insert the new comment into Supabase
        await supabase.from('comments').insert([newCommentObj]);
      } catch (error) {
        // Remove the comment from the UI if the insertion fails
        console.error('Failed to submit comment:', error);
        setComments((prevComments) =>
          prevComments.filter((comment) => comment !== newCommentObj)
        );
      } finally {
        // Clear the input field regardless of success or failure
        setNewComment('');
      }
    }
  };

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
                <p className="text-sm text-gray-500">by: {comment.username || 'Anonymous'}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No comments yet.</p>
          )}
        </div>

        {/* Add Comment Form */}
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