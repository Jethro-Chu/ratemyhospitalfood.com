'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createHospitalClient } from '@/lib/actions';
import { ArrowLeft, Building2, Loader2, MapPin, Plus } from 'lucide-react';

const inputBase = 'focus-ring w-full rounded-md border bg-white px-4 py-3.5 text-[16px] text-ink-900 placeholder:text-ink-300';

export default function AddHospitalPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  function clearFieldError(field) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(formData) {
    const name = (formData.get('name') || '').toString().trim();
    const location = (formData.get('location') || '').toString().trim();
    const errors = {};
    if (!name) errors.name = 'Enter the hospital name.';
    else if (name.length < 3) errors.name = 'Use at least 3 characters.';
    if (!location) errors.location = 'Enter a city and state.';

    setFieldErrors(errors);
    setSubmitError('');
    if (Object.keys(errors).length) return;

    setIsLoading(true);
    try {
      const result = await createHospitalClient({ name, location });
      if (!result?.id) throw new Error('No hospital returned');
      router.push(`/hospital/${result.id}?review=true`);
    } catch (error) {
      console.error(error);
      setSubmitError('We could not save that hospital. Try again in a moment.');
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      <Header />
      <main className="flex-grow">
        <section className="border-b border-ink-900/10 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
            <Link href="/search" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-500 transition-colors hover:text-brand-600">
              <ArrowLeft className="h-4 w-4" /> Back to directory
            </Link>
            <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <p className="section-kicker">New listing</p>
                <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-5xl">
                  Add a hospital cafeteria.
                </h1>
                <p className="mt-5 max-w-lg text-base leading-7 text-ink-500">
                  Create the listing, then you can publish its first food rating immediately.
                </p>

                <div className="mt-10 border-y border-ink-900/10">
                  <InfoRow icon={Building2} label="Use the full hospital name" />
                  <InfoRow icon={MapPin} label="Include city and state" />
                  <InfoRow icon={Plus} label="Existing listings are reused automatically" />
                </div>
              </div>

              <div className="lg:col-span-6 lg:col-start-7">
                <form action={handleSubmit} noValidate className="rounded-lg border border-ink-900/12 bg-cream-100 p-5 shadow-warm-sm sm:p-8">
                  <div className="border-b border-ink-900/10 pb-5">
                    <h2 className="font-display text-xl font-extrabold text-ink-900">Hospital details</h2>
                    <p className="mt-1 text-sm text-ink-500">Both fields are required.</p>
                  </div>

                  <div className="mt-6 space-y-6">
                    <Field label="Hospital name" htmlFor="hospital-name" error={fieldErrors.name} hint="Use the name shown on the building.">
                      <input
                        id="hospital-name" name="name" type="text" autoComplete="organization"
                        placeholder="St. Mary's Medical Center"
                        aria-invalid={fieldErrors.name ? 'true' : undefined}
                        onChange={() => clearFieldError('name')}
                        className={`${inputBase} ${fieldErrors.name ? 'border-red-700' : 'border-ink-900/15'}`}
                      />
                    </Field>

                    <Field label="Location" htmlFor="hospital-location" error={fieldErrors.location} hint="City, State — for example, Duarte, CA.">
                      <input
                        id="hospital-location" name="location" type="text" autoComplete="address-level2"
                        placeholder="Duarte, CA"
                        aria-invalid={fieldErrors.location ? 'true' : undefined}
                        onChange={() => clearFieldError('location')}
                        className={`${inputBase} ${fieldErrors.location ? 'border-red-700' : 'border-ink-900/15'}`}
                      />
                    </Field>
                  </div>

                  {submitError && <div role="alert" className="mt-5 rounded-md border border-red-200 bg-red-100 px-4 py-3 text-sm text-red-700">{submitError}</div>}

                  <button type="submit" disabled={isLoading} className="action-primary mt-7 w-full py-3.5">
                    {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Adding hospital…</> : <><Plus className="h-4 w-4" /> Add hospital and review</>}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function InfoRow({ icon: Icon, label }) {
  return <div className="flex items-center gap-3 border-b border-ink-900/10 py-4 last:border-b-0"><Icon className="h-4 w-4 text-brand-600" /><span className="text-sm font-semibold text-ink-700">{label}</span></div>;
}

function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-bold text-ink-800">{label}</label>
      {children}
      <p className={`mt-2 text-xs ${error ? 'font-semibold text-red-700' : 'text-ink-400'}`} role={error ? 'alert' : undefined}>{error || hint}</p>
    </div>
  );
}
