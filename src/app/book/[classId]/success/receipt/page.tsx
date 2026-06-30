import BookingSuccessReceiptPage from './ReceiptView';
import { SEED_CLASSES } from '@/lib/seedData';

// Pre-render all class IDs for the static export
export async function generateStaticParams() {
  return SEED_CLASSES.map(cls => ({ classId: cls.id }));
}

export default function Page() {
  return <BookingSuccessReceiptPage />;
}
