const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://abqldfmxtssgozimqnmx.supabase.co';
const supabaseKey = 'sb_publishable_UMqIuU8oYJ9dSxXkBwuutQ_4inpvOgG';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDb() {
  console.log('Testing connection to classes table...');
  const { data, error } = await supabase.from('classes').select('*').limit(1);
  if (error) {
    console.error('Error fetching classes:', error.message);
  } else {
    console.log('Classes:', data);
  }
}

checkDb();
