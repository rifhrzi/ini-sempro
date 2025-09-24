import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';

const formatIDR = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);

export default function Pay(props) {
  const {
    type,
    fixedAmount = 120000,
    paidThisPeriod = false,
    periodLabel,
    lastPayments = [],
    paymentPeriodMonths = 3,
    pendingProof = null,
  } = props;

  const { data, setData, post, processing, errors, reset } = useForm({ amount: fixedAmount });
  const proofForm = useForm({ proof: null });

  const proofInputRef = React.useRef(null);

  React.useEffect(() => {
    setData('amount', fixedAmount);
  }, [fixedAmount, setData]);

  const isSampah = type === 'sampah';
  const title = isSampah ? 'Bayar Iuran Sampah' : 'Bayar Iuran Ronda';
  const otherType = isSampah ? 'ronda' : 'sampah';

  const submit = (event) => {
    event.preventDefault();
    post(route('iuran.pay.store', { type }), {
      preserveScroll: true,
      onSuccess: () => {
        reset('amount');
      },
    });
  };

  const handleProofChange = (event) => {
    const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;
    proofForm.setData('proof', file);
  };

  const submitProof = (event) => {
    event.preventDefault();
    if (!pendingProof) {
      return;
    }

    proofForm.post(route('iuran.pay.proof', pendingProof.id), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        proofForm.reset();
        if (proofInputRef.current) {
          proofInputRef.current.value = '';
        }
      },
    });
  };

  const statusClass = paidThisPeriod ? 'text-green-600' : 'text-red-600';
  const statusText = paidThisPeriod ? 'Sudah Bayar' : 'Belum Bayar';
  const periodText = periodLabel || `Periode ${paymentPeriodMonths} Bulan`;

  return (
    <AuthenticatedLayout auth={props.auth} errors={props.errors} header={<h2 className="font-semibold text-xl">{title}</h2>}>
      <Head title={title} />

      <div className="py-8">
        <div className="max-w-3xl mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* Context cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-base-100 shadow border border-gray-100">
              <div className="card-body">
                <div className="text-sm text-gray-500">Jenis Iuran</div>
                <div className="text-lg font-semibold uppercase">{type}</div>
              </div>
            </div>
            <div className="card bg-base-100 shadow border border-gray-100">
              <div className="card-body">
                <div className="text-sm text-gray-500">Periode</div>
                <div className="text-lg font-semibold">{periodText}</div>
              </div>
            </div>
            <div className="card bg-base-100 shadow border border-gray-100">
              <div className="card-body">
                <div className="text-sm text-gray-500">Status Periode Ini</div>
                <div className={`text-lg font-semibold ${statusClass}`}>
                  {statusText}
                </div>
              </div>
            </div>
          </div>

          {/* Payment form */}
          <div className="bg-base-100 rounded-lg shadow border border-gray-100 p-6 space-y-6">
            {paidThisPeriod && (
              <div className="alert alert-info">
                <span>Anda sudah membayar untuk periode ini. Pembayaran ulang akan memperbarui tanggal bayar dan menggantikan nominal tetap.</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-6">
              <div>
                <label className="label"><span className="label-text">Nominal</span></label>
                <div className="join w-full">
                  <span className="join-item btn btn-ghost no-animation pointer-events-none">IDR</span>
                  <input
                    type="text"
                    className="join-item input input-bordered w-full"
                    value={formatIDR(fixedAmount)}
                    readOnly
                    disabled
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Pembayaran iuran ditetapkan sebesar {formatIDR(fixedAmount)} dan berlaku setiap {paymentPeriodMonths} bulan.
                </div>
                {errors.amount && <p className="text-error text-sm mt-1">{errors.amount}</p>}
              </div>

              {/* Hidden input to keep value in the form state */}
              <input type="hidden" name="amount" value={data.amount} />

              <div className="flex items-center gap-3">
                <button type="submit" className="btn btn-primary" disabled={processing}>
                  {processing ? 'Memproses...' : 'Bayar Sekarang'}
                </button>
                <Link href={route('dashboard')} className="btn">Kembali</Link>
                <Link href={route('iuran.pay.create', { type: otherType })} className="btn btn-ghost">Ke Iuran {otherType}</Link>
              </div>
            </form>
          </div>

          {pendingProof && (
            <div className="bg-base-100 rounded-lg shadow border border-gray-100 p-6 space-y-4">
              <h3 className="font-semibold text-gray-700">Unggah Bukti Transfer</h3>
              <p className="text-sm text-gray-500">Kami telah menerima pembayaran Anda. Silakan unggah foto bukti transfer agar admin dapat memverifikasi.</p>

              <form onSubmit={submitProof} encType="multipart/form-data" className="space-y-4">
                <div>
                  <label className="label"><span className="label-text">Bukti Transfer (Foto)</span></label>
                  <input
                    ref={proofInputRef}
                    type="file"
                    accept="image/*"
                    className="file-input file-input-bordered w-full"
                    onChange={handleProofChange}
                  />
                  <div className="text-xs text-gray-500 mt-1">Unggah foto bukti transfer dalam format JPG/PNG, maksimal 5MB.</div>
                  {proofForm.data.proof && <div className="text-xs text-gray-600 mt-1">File dipilih: {proofForm.data.proof.name}</div>}
                  {proofForm.errors.proof && <p className="text-error text-sm mt-1">{proofForm.errors.proof}</p>}
                </div>

                <div className="flex items-center gap-3">
                  <button type="submit" className="btn btn-primary" disabled={proofForm.processing}>
                    {proofForm.processing ? 'Mengunggah...' : 'Simpan Bukti'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Payment history */}
          <div className="bg-base-100 rounded-lg shadow border border-gray-100 p-6">
            <h3 className="font-semibold mb-3">Riwayat Pembayaran</h3>
            {Array.isArray(lastPayments) && lastPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Nominal</th>
                      <th>Status</th>
                      <th>Bukti</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lastPayments.map((p) => (
                      <tr key={p.id}>
                        <td>{p.paid_at ? new Date(p.paid_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}</td>
                        <td>{formatIDR(p.amount)}</td>
                        <td>{p.paid ? 'Aktif' : 'Tidak Aktif'}</td>
                        <td>
                          {p.proof_url ? (
                            <a href={p.proof_url} className="link link-primary" target="_blank" rel="noopener noreferrer">
                              Lihat
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Belum ada riwayat pembayaran.</div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
