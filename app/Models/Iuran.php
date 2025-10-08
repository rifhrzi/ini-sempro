<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Iuran extends Model
{
    use HasFactory;

    /**
     * Nominal iuran tetap per periode (dalam rupiah).
     */
    public const FIXED_AMOUNT = 120_000;

    /**
     * Lama satu periode pembayaran dalam bulan.
     */
    public const PAYMENT_PERIOD_MONTHS = 3;

    protected $fillable = [
        'user_id',
        'order_id',
        'type', // sampah | ronda
        'amount',
        'paid',
        'paid_at',
        'proof_path',
    ];

    protected $casts = [
        'paid' => 'boolean',
        'paid_at' => 'datetime',
    ];

    protected $appends = [
        'proof_url',
    ];

    /**
     * Menandai pembayaran lama sebagai belum lunas saat periode aktif sudah lewat.
     */
    public static function expireStalePayments(): void
    {
        // Hitung tanggal batas berdasarkan panjang periode iuran.
        $threshold = Carbon::now()->subMonthsNoOverflow(static::PAYMENT_PERIOD_MONTHS);

        static::query()
            ->where('paid', true)
            ->whereNotNull('paid_at')
            ->where('paid_at', '<=', $threshold)
            ->update(['paid' => false]);
    }

    /**
     * Relasi ke pengguna yang melakukan pembayaran.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Menghasilkan URL publik untuk bukti pembayaran yang tersimpan.
     */
    public function getProofUrlAttribute(): ?string
    {
        return $this->proof_path ? Storage::url($this->proof_path) : null;
    }
}
