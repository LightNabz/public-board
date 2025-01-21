import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function NewPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [username, setUsername] = useState("");

  // Generate a temporary user_id (you could use session or unique random value)
  const user_id = Math.random().toString(36).substring(2, 15);

  async function handleSubmit(e) {
    e.preventDefault();
    const { data, error } = await supabase.from("posts").insert([
      { title, content, username: username || "Anonymous", user_id },
    ]);

    if (error) {
      console.error("Error creating post:", error);
    } else {
      alert("Post created!");
      // Refresh the page to reflect the new post
      location.reload();
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create a New Post</h1>
      <form onSubmit={handleSubmit}>
        <input
          className="block w-full p-2 border mb-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="block w-full p-2 border mb-2"
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>
        <input
          className="block w-full p-2 border mb-4"
          placeholder="Username (optional)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          Submit
        </button>
      </form>
    </div>
  );
}
