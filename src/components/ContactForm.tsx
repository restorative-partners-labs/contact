'use client';

import { useState, useId } from 'react';
import { z } from 'zod';
import { Button } from '@/components/Button';

const formSchema = z.object({
  staffId: z.string().min(8).max(128),
  name: z.string().min(1, 'Name is required').max(120, 'Name must be less than 120 characters'),
  email: z.string().email('Please enter a valid email').max(254, 'Email must be less than 254 characters'),
  subject: z.string().max(200, 'Subject must be less than 200 characters').optional(),
  message: z.string().min(1, 'Message is required').max(5000, 'Message must be less than 5000 characters'),
});

type FormData = z.infer<typeof formSchema>;

interface ContactFormProps {
  staffId: string;
}

function TextInput({
  label,
  error,
  ...props
}: React.ComponentPropsWithoutRef<'input'> & { 
  label: string;
  error?: string;
}) {
  const id = useId();

  return (
    <div className="group relative z-0 transition-all focus-within:z-10">
      <input
        id={id}
        {...props}
        placeholder=" "
        className={`peer block w-full border border-neutral-300 bg-transparent px-6 pt-12 pb-4 text-base/6 text-neutral-950 ring-4 ring-transparent transition group-first:rounded-t-2xl group-last:rounded-b-2xl focus:border-neutral-950 focus:ring-neutral-950/5 focus:outline-hidden ${
          error ? 'border-red-300' : ''
        }`}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute top-1/2 left-6 -mt-3 origin-left text-base/6 text-neutral-500 transition-all duration-200 peer-not-placeholder-shown:-translate-y-4 peer-not-placeholder-shown:scale-75 peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-neutral-950 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:font-semibold peer-focus:text-neutral-950"
      >
        {label}
      </label>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

function TextArea({
  label,
  error,
  value,
  ...props
}: React.ComponentPropsWithoutRef<'textarea'> & { 
  label: string;
  error?: string;
  value?: string;
}) {
  const id = useId();

  return (
    <div className="group relative z-0 transition-all focus-within:z-10">
      <textarea
        id={id}
        {...props}
        value={value}
        placeholder=" "
        className={`peer block w-full border border-neutral-300 bg-transparent px-6 pt-12 pb-4 text-base/6 text-neutral-950 ring-4 ring-transparent transition group-first:rounded-t-2xl group-last:rounded-b-2xl focus:border-neutral-950 focus:ring-neutral-950/5 focus:outline-hidden resize-none ${
          error ? 'border-red-300' : ''
        }`}
      />
      <label
        htmlFor={id}
        className={`pointer-events-none absolute top-1/2 left-6 -mt-3 origin-left text-base/6 text-neutral-500 transition-all duration-200 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:font-semibold peer-focus:text-neutral-950 ${
          value && value.trim().length > 0 ? 'opacity-0' : ''
        }`}
      >
        {label}
      </label>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

export function ContactForm({ staffId }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    staffId,
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      formSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<FormData> = {};
        (error as any).errors.forEach((err: any) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof FormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.ok) {
        setSubmitStatus('success');
        setSubmitMessage('Message sent successfully!');
        setFormData({
          staffId,
          name: '',
          email: '',
          subject: '',
          message: '',
        });
      } else {
        setSubmitStatus('error');
        setSubmitMessage(result.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Hidden staff ID field */}
      <input type="hidden" name="staffId" value={staffId} />
      
      <div className="isolate mt-6 -space-y-px rounded-2xl bg-white/50">
        <TextInput 
          label="Name" 
          name="name" 
          autoComplete="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          error={errors.name}
        />
        
        <TextInput
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={errors.email}
        />
        
        <TextInput
          label="Subject (optional)"
          name="subject"
          value={formData.subject}
          onChange={(e) => handleInputChange('subject', e.target.value)}
          error={errors.subject}
        />
        
        <TextArea
          label="Message"
          name="message"
          rows={5}
          value={formData.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
          error={errors.message}
        />
      </div>
      
      <div className="flex justify-center mt-10">
        <Button 
          type="submit" 
          className="bg-neutral-900 text-[#f6b100] hover:bg-neutral-700" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send'}
        </Button>
      </div>

      {/* Status messages */}
      {submitStatus === 'success' && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-2xl">
          <p className="text-sm text-green-800 font-medium">{submitMessage}</p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <p className="text-sm text-red-800 font-medium">{submitMessage}</p>
        </div>
      )}
    </form>
  );
}
