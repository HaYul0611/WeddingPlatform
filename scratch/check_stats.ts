import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length > 0) {
      process.env[key.trim()] = rest.join('=').trim();
    }
  });
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, key);

async function checkStats() {
  console.log('--- Checking Stats Query ---');
  const { data, error, count } = await supabase.from('leads').select('status, category', { count: 'exact' });

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Count:', count);
    console.log('Data Sample:', data?.slice(0, 5));

    const stats = {
      total: data?.length || 0,
      new: data?.filter(l => l.status === 'new').length,
      contacted: data?.filter(l => l.status === 'contacted').length,
      completed: data?.filter(l => l.status === 'completed').length,
    };
    console.log('Calculated Stats:', stats);
  }
}

checkStats();
