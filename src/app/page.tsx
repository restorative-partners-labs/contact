import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the contact form
  redirect('/form');
}
