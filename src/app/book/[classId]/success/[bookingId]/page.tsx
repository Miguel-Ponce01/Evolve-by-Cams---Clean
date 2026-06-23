import BookingSuccessReceiptPage from './ReceiptView';

export async function generateStaticParams() {
  return [{ classId: 'session', bookingId: 'receipt' }];
}

export const dynamicParams = false;

export default function Page() {
  return <BookingSuccessReceiptPage />;
}
