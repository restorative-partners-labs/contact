import { notFound } from 'next/navigation';
import { STAFF_BY_ID } from '@/data/staff';
import { ContactForm } from '@/components/ContactForm';

interface FormPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function FormPage({ params }: FormPageProps) {
  const { id } = await params;
  
  // Check if the staff ID exists
  if (!STAFF_BY_ID[id]) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="mx-auto max-w-2xl px-4">
        
        <ContactForm staffId={id} />
      </div>
    </div>
  );
}
