import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { postId } = req.body;
    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Post deleted successfully' });
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
