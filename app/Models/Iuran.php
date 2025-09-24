<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Iuran extends Model
{
    use HasFactory;

    public const FIXED_AMOUNT = 120_000;
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

    public static function expireStalePayments(): void
    {
        $threshold = Carbon::now()->subMonthsNoOverflow(static::PAYMENT_PERIOD_MONTHS);

        static::query()
            ->where('paid', true)
            ->whereNotNull('paid_at')
            ->where('paid_at', '<=', $threshold)
            ->update(['paid' => false]);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getProofUrlAttribute(): ?string
    {
        return $this->proof_path ? Storage::url($this->proof_path) : null;
    }
}
