import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Create(props) {
  const { data, setData, post, processing, errors, reset } = useForm({
    title: '',
    description: '',
    category: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('sempro.store'), {
      onSuccess: () => reset(),
      preserveScroll: true,
    });
  };

  return (
    <AuthenticatedLayout auth={props.auth} errors={props.errors}
      header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Buat Sempro</h2>}>
      <Head title="Buat Sempro" />
      <div className="py-6">
        <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-base-100 overflow-hidden shadow-xl sm:rounded-lg p-6">
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium">Judul</label>
                <input id="title" type="text" value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  className="mt-1 input input-bordered w-full" />
                {errors.title && <p className="mt-1 text-sm text-error">{errors.title}</p>}
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium">Deskripsi</label>
                <textarea id="description" value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  className="mt-1 textarea textarea-bordered w-full" />
                {errors.description && <p className="mt-1 text-sm text-error">{errors.description}</p>}
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium">Kategori</label>
                <input id="category" type="text" value={data.category}
                  onChange={(e) => setData('category', e.target.value)}
                  className="mt-1 input input-bordered w-full" />
                {errors.category && <p className="mt-1 text-sm text-error">{errors.category}</p>}
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={processing} className="btn btn-primary">
                  {processing ? 'Mengirim...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

