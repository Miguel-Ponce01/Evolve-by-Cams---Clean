import InstructorProfile from './InstructorProfile';
import { INSTRUCTORS } from '@/lib/seedData';

export function generateStaticParams() {
  return INSTRUCTORS.map((instructor) => ({
    id: instructor.id,
  }));
}

export default function Page() {
  return <InstructorProfile />;
}