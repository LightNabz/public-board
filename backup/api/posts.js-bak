import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { title, content, username, expires_at } = req.body;
    const { data, error } = await supabase
      .from('posts')
      .insert([{ title, content, username: username || 'Anonymous', expires_at }]);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
  }
  res.status(405).json({ error: 'Method Not Allowed' });
}
