import SuccessPageContent from './SuccessView';

export async function generateStaticParams() {
  return [{ classId: 'session' }];
}

export const dynamicParams = false;

export default function Page() {
  return <SuccessPageContent />;
}
