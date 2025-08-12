'use client';

import { useSearchParams } from 'next/navigation';
import { ContactForm } from '@/components/ContactForm';

export default function FormPage() {
  const searchParams = useSearchParams();
  const staffId = searchParams.get('sid');
  
  if (!staffId) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            Invalid Request
          </h1>
          <p className="text-neutral-600">
            Staff ID is required. Please use a valid link.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="mx-auto max-w-2xl px-4">
        
        <ContactForm staffId={staffId} />
      </div>
    </div>
  );
}
