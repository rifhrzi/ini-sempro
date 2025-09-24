import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React from 'react';
import IuranForm from './Form';

export default function Edit(props) {
  const { users, iuran, fixedAmount } = props;
  // Normalize paid_at for datetime-local input
  const norm = (val) => {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d)) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const initialValues = { ...iuran, paid_at: norm(iuran.paid_at) };
  return (
    <AuthenticatedLayout auth={props.auth} errors={props.errors} header={<h2 className="font-semibold text-xl">Edit Iuran</h2>}>
      <Head title="Edit Iuran" />
      <div className="py-8">
        <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-base-100 p-6 rounded-lg shadow border border-gray-100">
            <IuranForm users={users} fixedAmount={fixedAmount} initialValues={initialValues} onSubmitRoute={route('admin.iurans.update', iuran.id)} method="put" submitLabel="Update" />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

