import BookingTerminalPage from './BookingTerminal';
import { SEED_CLASSES } from '@/lib/seedData';

export async function generateStaticParams() {
  return SEED_CLASSES.map(cls => ({ classId: cls.id }));
}

export default function Page() {
  return <BookingTerminalPage />;
}
