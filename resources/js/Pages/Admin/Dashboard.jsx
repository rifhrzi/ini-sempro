import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { BanknotesIcon, UsersIcon, TrashIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

const StatCard = ({ label, value, accent = 'primary' }) => {
    const idr = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
    const isMoney = typeof value === 'number' && value > 1000;
    const accentClass = {
        primary: 'text-primary',
        secondary: 'text-secondary',
        info: 'text-info',
        success: 'text-success',
        warning: 'text-warning',
        error: 'text-error',
    }[accent] || 'text-primary';
    return (
        <div className="card bg-base-100 shadow-md border border-gray-100">
            <div className="card-body">
                <h4 className="card-title text-gray-700">{label}</h4>
                <div className={`text-2xl font-bold ${accentClass}`}>{isMoney ? idr(value) : value}</div>
            </div>
        </div>
    );
};

export default function AdminDashboard(props) {
    const { stats, filters, trend } = props;
    const collected = stats?.totalKeseluruhan ?? 0;
    const totalKeluarga = stats?.totalKeluarga ?? 0;
    const totalSampah = stats?.totalSampah ?? 0;
    const totalRonda = stats?.totalRonda ?? 0;
    const month = filters?.month ?? (new Date().getMonth() + 1);
    const year = filters?.year ?? (new Date().getFullYear());
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; 

    const onChange = (e) => {
        const params = new URLSearchParams(window.location.search);
        params.set(e.target.name, e.target.value);
        window.location.href = `${window.location.pathname}?${params.toString()}`;
    };

    return (
        <AuthenticatedLayout
            auth={props.auth}
            errors={props.errors}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Admin Dashboard</h2>}
        >
            <Head title="Admin Dashboard" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Filters */}
                    <div className="bg-base-100 shadow-md rounded-lg p-4 border border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="form-control">
                            <label className="label"><span className="label-text">Bulan</span></label>
                            <select name="month" value={month} onChange={onChange} className="select select-bordered">
                                {months.map((m, i) => (
                                    <option key={i+1} value={i+1}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Tahun</span></label>
                            <select name="year" value={year} onChange={onChange} className="select select-bordered">
                                {Array.from({length: 5}, (_,k) => new Date().getFullYear() - k).map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="stats shadow w-full bg-base-100">
                        <div className="stat">
                            <div className="stat-figure text-primary"><BanknotesIcon className="w-8 h-8" /></div>
                            <div className="stat-title">Total Iuran Keseluruhan</div>
                            <div className="stat-value text-primary">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(collected)}</div>
                        </div>
                        <div className="stat">
                            <div className="stat-figure text-secondary"><UsersIcon className="w-8 h-8" /></div>
                            <div className="stat-title">Total Data Keluarga</div>
                            <div className="stat-value text-secondary">{totalKeluarga}</div>
                            <div className="stat-desc">Keluarga terdata</div>
                        </div>
                        <div className="stat">
                            <div className="stat-figure text-info"><TrashIcon className="w-8 h-8" /></div>
                            <div className="stat-title">Total Iuran Sampah</div>
                            <div className="stat-value text-info">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalSampah)}</div>
                        </div>
                        <div className="stat">
                            <div className="stat-figure text-success"><ShieldCheckIcon className="w-8 h-8" /></div>
                            <div className="stat-title">Total Iuran Ronda</div>
                            <div className="stat-value text-success">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalRonda)}</div>
                        </div>
                    </div>
                    <div>
                        <Link href={route('admin.iurans.index')} className="btn btn-outline">Kelola Iuran</Link>
                    </div>

                    {/* Simple bar chart */}
                    <div className="bg-base-100 shadow-md rounded-lg p-6 border border-gray-100">
                        <h4 className="font-semibold text-gray-700 mb-4">Tren 6 Bulan</h4>
                        <div className="text-sm text-gray-500 mb-2">Total iuran per bulan</div>
                        {Array.isArray(trend) && trend.length > 0 ? (
                            <div className="w-full overflow-x-auto">
                                <div className="grid grid-cols-6 gap-4 items-end h-48">
                                    {trend.map((t, idx) => {
                                        const max = Math.max(...trend.map(x => x.keseluruhan || 0), 1);
                                        const height = Math.round(((t.keseluruhan || 0) / max) * 100);
                                        return (
                                            <div key={idx} className="flex flex-col items-center justify-end gap-2">
                                                <div className="w-8 bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-md" style={{ height: `${height}%` }} title={`${t.label}: ${new Intl.NumberFormat('id-ID').format(t.keseluruhan || 0)}`}></div>
                                                <div className="text-xs text-gray-500">{t.label}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">Tidak ada data tren.</div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
