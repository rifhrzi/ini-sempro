import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { UsersIcon, TrashIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

export default function Dashboard(props) {
    // Read values from props if provided; otherwise use sensible defaults
    const collected = props?.dashboard?.collected ?? 1_000_000;
    const target = props?.dashboard?.target ?? 5_000_000;
    const familiesCount = props?.dashboard?.familiesCount ?? 50;
    const trashPaid = props?.dashboard?.trashPaid ?? false;
    const rondaPaid = props?.dashboard?.rondaPaid ?? true;
    const isAdmin = Boolean(props?.auth?.user?.is_admin);

    const percent = Math.min(100, Math.round((collected / Math.max(1, target)) * 100));
    const idr = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
    const gridColsClass = isAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2';

    return (
        <AuthenticatedLayout
            auth={props.auth}
            errors={props.errors}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Summary card (admin only) */}
                    {isAdmin && (
                        <div className="card bg-base-100 shadow-md border border-gray-100">
                            <div className="card-body">
                                <h3 className="card-title">Total Iuran Terkumpul Bulan Ini</h3>
                                <progress className="progress progress-primary w-full" value={percent} max="100"></progress>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Terkumpul: <span className="font-medium text-gray-700">{idr(collected)}</span></span>
                                    <span>Target: <span className="font-medium text-gray-700">{idr(target)}</span></span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cards grid */}
                    <div className={`grid grid-cols-1 ${gridColsClass} gap-6`}>
                        {/* Jumlah Keluarga (admin only) */}
                        {isAdmin && (
                            <div className="card bg-base-100 shadow-md border border-gray-100">
                                <div className="card-body items-center text-center">
                                    <div className="avatar placeholder mb-2">
                                        <div className="bg-amber-100 text-amber-600 rounded-full w-20 flex items-center justify-center">
                                            <UsersIcon className="w-10 h-10" />
                                        </div>
                                    </div>
                                    <h4 className="card-title">Jumlah Keluarga</h4>
                                    <p className="text-gray-600">{familiesCount} Keluarga</p>
                                </div>
                            </div>
                        )}

                        {/* Iuran Sampah */}
                        <div className="card bg-base-100 shadow-md border border-gray-100">
                            <div className="card-body items-center text-center">
                                <div className="avatar placeholder mb-2">
                                    <div className="bg-emerald-100 text-emerald-600 rounded-full w-20 flex items-center justify-center">
                                        <TrashIcon className="w-10 h-10" />
                                    </div>
                                </div>
                                <h4 className="card-title">Iuran Sampah</h4>
                                <div className="mt-1">
                                    <span className={`badge ${trashPaid ? 'badge-success' : 'badge-ghost'}`}>
                                        {trashPaid ? 'Sudah Bayar' : 'Belum Bayar'}
                                    </span>
                                </div>
                                <div className="card-actions mt-3">
                                    {trashPaid ? (
                                        <Link href={route('iuran.pay.create', { type: 'sampah' })} className="btn btn-outline">Lihat Riwayat</Link>
                                    ) : (
                                        <Link href={route('iuran.pay.create', { type: 'sampah' })} className="btn btn-primary">Bayar Iuran</Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Iuran Ronda */}
                        <div className="card bg-base-100 shadow-md border border-gray-100">
                            <div className="card-body items-center text-center">
                                <div className="avatar placeholder mb-2">
                                    <div className="bg-blue-100 text-blue-600 rounded-full w-20 flex items-center justify-center">
                                        <ShieldCheckIcon className="w-10 h-10" />
                                    </div>
                                </div>
                                <h4 className="card-title">Iuran Ronda</h4>
                                <div className="mt-1">
                                    <span className={`badge ${rondaPaid ? 'badge-success' : 'badge-ghost'}`}>
                                        {rondaPaid ? 'Sudah Bayar' : 'Belum Bayar'}
                                    </span>
                                </div>
                                <div className="card-actions mt-3">
                                    {rondaPaid ? (
                                        <Link href={route('iuran.pay.create', { type: 'ronda' })} className="btn btn-outline">Lihat Riwayat</Link>
                                    ) : (
                                        <Link href={route('iuran.pay.create', { type: 'ronda' })} className="btn btn-primary">Bayar Iuran</Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
