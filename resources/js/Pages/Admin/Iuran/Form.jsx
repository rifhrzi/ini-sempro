import { useForm, Link } from '@inertiajs/react';
import React from 'react';

export default function IuranForm({
  users,
  fixedAmount = 120000,
  initialValues = {},
  submitLabel = 'Save',
  onSubmitRoute,
  method = 'post',
}) {
  const enforcedAmount = typeof fixedAmount === 'number' ? fixedAmount : 120000;
  const { data, setData, post, put, processing, errors } = useForm({
    user_id: initialValues.user_id ?? '',
    type: initialValues.type ?? 'sampah',
    amount: initialValues.amount ?? enforcedAmount,
    paid: initialValues.paid ?? false,
    paid_at: initialValues.paid_at ?? '',
  });

  React.useEffect(() => {
    setData('amount', enforcedAmount);
  }, [enforcedAmount, setData]);

  const submit = (e) => {
    e.preventDefault();
    if (method === 'put') {
      put(onSubmitRoute);
    } else {
      post(onSubmitRoute);
    }
  };

  const formatIDR = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Pengguna (opsional)</label>
          <select
            className="select select-bordered w-full"
            value={data.user_id}
            onChange={(e) => setData('user_id', e.target.value || '')}
          >
            <option value="">Tidak memilih</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
          {errors.user_id && <div className="text-sm text-red-600 mt-1">{errors.user_id}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Jenis Iuran</label>
          <select className="select select-bordered w-full" value={data.type} onChange={(e) => setData('type', e.target.value)}>
            <option value="sampah">Sampah</option>
            <option value="ronda">Ronda</option>
          </select>
          {errors.type && <div className="text-sm text-red-600 mt-1">{errors.type}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nominal (tetap)</label>
          <input
            className="input input-bordered w-full"
            type="text"
            value={formatIDR(enforcedAmount)}
            readOnly
            disabled
          />
          <div className="text-xs text-gray-500 mt-1">Nominal iuran dikunci pada {formatIDR(enforcedAmount)}.</div>
          {errors.amount && <div className="text-sm text-red-600 mt-1">{errors.amount}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select className="select select-bordered w-full" value={data.paid ? '1' : '0'}
                  onChange={(e) => setData('paid', e.target.value === '1')}>
            <option value="0">Belum Bayar</option>
            <option value="1">Sudah Bayar</option>
          </select>
          {errors.paid && <div className="text-sm text-red-600 mt-1">{errors.paid}</div>}
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Tanggal Bayar</label>
          <input className="input input-bordered w-full" type="datetime-local" value={data.paid_at ?? ''}
                 onChange={(e) => setData('paid_at', e.target.value)} />
          <div className="text-xs text-gray-500 mt-1">Kosongkan untuk otomatis diisi sekarang ketika status Sudah Bayar.</div>
          {errors.paid_at && <div className="text-sm text-red-600 mt-1">{errors.paid_at}</div>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button type="submit" disabled={processing} className="btn btn-primary">{submitLabel}</button>
        <Link href={route('admin.iurans.index')} className="btn btn-ghost">Batal</Link>
      </div>
    </form>
  );
}
