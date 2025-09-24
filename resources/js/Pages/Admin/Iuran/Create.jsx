import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React from 'react';
import IuranForm from './Form';

export default function Create(props) {
  const { users, fixedAmount } = props;
  return (
    <AuthenticatedLayout auth={props.auth} errors={props.errors} header={<h2 className="font-semibold text-xl">Buat Iuran</h2>}>
      <Head title="Buat Iuran" />
      <div className="py-8">
        <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-base-100 p-6 rounded-lg shadow border border-gray-100">
            <IuranForm users={users} fixedAmount={fixedAmount} onSubmitRoute={route('admin.iurans.store')} submitLabel="Simpan" />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}


