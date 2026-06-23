import BookingSuccessReceiptPage from './ReceiptView';
import { SEED_CLASSES } from '@/lib/seedData';

// Pre-render all class IDs. bookingId is runtime-generated so we provide
// a single placeholder — actual navigation uses client-side routing via
// router.push(), which works correctly as an SPA without a page reload.
export async function generateStaticParams() {
  return SEED_CLASSES.map(cls => ({ classId: cls.id, bookingId: 'receipt' }));
}

export default function Page() {
  return <BookingSuccessReceiptPage />;
}
