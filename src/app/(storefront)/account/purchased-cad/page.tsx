import { redirect } from 'next/navigation';

export default function PurchasedCadRedirectPage() {
  redirect('/account');
}
