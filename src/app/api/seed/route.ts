import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { INSTRUCTORS, SEED_CLASSES } from '@/lib/seedData';
import crypto from 'crypto';

export async function POST() {
  const cookieStore = await cookies();

  // Note: For seeding, you usually want to bypass RLS, 
  // so you should use the SUPABASE_SERVICE_ROLE_KEY if available in your .env
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore if in a server component
          }
        },
      },
    }
  );

  try {
    // 1. Seed Instructors
    const instructorMap = new Map<string, string>(); // mockId -> uuid
    for (const inst of INSTRUCTORS) {
      const uuid = crypto.randomUUID();
      instructorMap.set(inst.id, uuid);

      await supabase.from('instructors').insert({
        id: uuid,
        full_name: inst.name,
        bio: inst.bio,
        avatar_url: inst.avatar,
        is_active: true,
      });
    }

    // 2. Seed Class Definitions & Schedules
    const classDefMap = new Map<string, string>(); // title -> uuid
    for (const cls of SEED_CLASSES) {
      if (!classDefMap.has(cls.title)) {
        const defUuid = crypto.randomUUID();
        classDefMap.set(cls.title, defUuid);

        // Fallback category mapping. Update based on your Postgres enum 'class_category'
        await supabase.from('class_definitions').insert({
          id: defUuid,
          name: cls.title,
          category: 'Pole',
          description: cls.description,
          duration_minutes: cls.duration,
        });
      }

      const defId = classDefMap.get(cls.title);
      const instructorUuid = instructorMap.get(cls.instructor.id);

      // Parse date and time
      const dateStr = cls.date;
      const timeParts = cls.time.match(/(\d+):(\d+)\s+(AM|PM)/i);
      let hours = 0;
      let mins = 0;
      if (timeParts) {
        hours = parseInt(timeParts[1]);
        mins = parseInt(timeParts[2]);
        if (timeParts[3].toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (timeParts[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
      }
      
      const startTime = new Date(`${dateStr}T${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`);
      const endTime = new Date(startTime.getTime() + cls.duration * 60000);

      await supabase.from('class_schedules').insert({
        id: crypto.randomUUID(),
        class_definition_id: defId,
        instructor_id: instructorUuid,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        max_capacity: cls.totalSpots,
        waitlist_capacity: 2,
      });
    }

    return NextResponse.json({ success: true, message: 'Seeding completed successfully.' });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
