import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import React from 'react';

const formatIDR = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);

export default function Index(props) {
  const { iurans, filters } = props;

  const [type, setType] = React.useState(filters?.type || '');
  const [paid, setPaid] = React.useState(filters?.paid ?? '');

  const applyFilters = () => {
    const params = {};
    if (type) params.type = type;
    if (paid !== '') params.paid = paid;
    router.get(route('admin.iurans.index'), params, { preserveState: true, replace: true });
  };

  const resetFilters = () => {
    setType('');
    setPaid('');
    router.get(route('admin.iurans.index'), {}, { preserveState: true, replace: true });
  };

  const destroy = (id) => {
    if (confirm('Hapus iuran ini?')) {
      router.delete(route('admin.iurans.destroy', id), { preserveScroll: true });
    }
  };

  return (
    <AuthenticatedLayout auth={props.auth} errors={props.errors} header={<h2 className="font-semibold text-xl">Iuran</h2>}>
      <Head title="Iuran" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-4">
          <div className="flex justify-between items-center">
            <div className="breadcrumbs text-sm">
              <ul>
                <li><Link href={route('admin.dashboard')}>Admin</Link></li>
                <li>Iuran</li>
              </ul>
            </div>
            <Link href={route('admin.iurans.create')} className="btn btn-primary">Buat Iuran</Link>
          </div>

          {/* Filters */}
          <div className="bg-base-100 rounded-lg shadow border border-gray-100 p-4 flex flex-wrap gap-4 items-end">
            <div className="form-control">
              <label className="label"><span className="label-text">Jenis</span></label>
              <select className="select select-bordered" value={type} onChange={(e)=>setType(e.target.value)}>
                <option value="">Semua</option>
                <option value="sampah">Sampah</option>
                <option value="ronda">Ronda</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Status</span></label>
              <select className="select select-bordered" value={paid} onChange={(e)=>setPaid(e.target.value)}>
                <option value="">Semua</option>
                <option value="1">Sudah</option>
                <option value="0">Belum</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={applyFilters}>Filter</button>
              <button className="btn" onClick={resetFilters}>Reset</button>
            </div>
          </div>

          <div className="overflow-x-auto bg-base-100 rounded-lg shadow border border-gray-100">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Pengguna</th>
                  <th>Jenis</th>
                  <th>Nominal</th>
                  <th>Bukti Transfer</th>
                  <th>Status</th>
                  <th>Dibayar Pada</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {iurans.data.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.user ? `${item.user.name} (${item.user.email})` : '-'}</td>
                    <td className="uppercase">{item.type}</td>
                    <td>{formatIDR(item.amount)}</td>
                    <td>
                      {item.proof_url ? (
                        <a href={item.proof_url} target="_blank" rel="noopener noreferrer" className="link link-primary">Lihat</a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td>
                      {item.paid ? (
                        <span className="badge badge-success">Sudah</span>
                      ) : (
                        <span className="badge badge-ghost">Belum</span>
                      )}
                    </td>
                    <td>{item.paid_at ? new Date(item.paid_at).toLocaleString('id-ID') : '-'}</td>
                    <td className="flex gap-2">
                      <Link href={route('admin.iurans.edit', item.id)} className="btn btn-sm">Edit</Link>
                      <button onClick={() => destroy(item.id)} className="btn btn-sm btn-error">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {iurans.links?.length > 0 && (
            <div className="join">
              {iurans.links.map((l, i) => (
                l.url ? (
                  <Link key={i} href={l.url} className={`join-item btn btn-sm ${l.active ? 'btn-active' : ''}`} dangerouslySetInnerHTML={{__html: l.label}} />
                ) : (
                  <button key={i} className="join-item btn btn-sm" disabled dangerouslySetInnerHTML={{__html: l.label}} />
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
