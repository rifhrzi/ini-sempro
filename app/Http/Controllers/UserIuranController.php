<?php

namespace App\Http\Controllers;

use App\Models\Iuran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class UserIuranController extends Controller
{
    /**
     * Menampilkan halaman pembayaran untuk jenis iuran tertentu.
     */
    public function create(Request $request, string $type)
    {
        abort_unless(in_array($type, ['sampah', 'ronda'], true), 404);

        // Pastikan status iuran lama yang melewati periode aktif ditandai ulang.
        Iuran::expireStalePayments();

        $user = $request->user();
        $fixedAmount = Iuran::FIXED_AMOUNT;
        $periodMonths = Iuran::PAYMENT_PERIOD_MONTHS;

        // Hitung rentang tanggal yang mewakili periode penagihan saat ini.
        $periodStart = now()->copy()->subMonthsNoOverflow(max(0, $periodMonths - 1))->startOfMonth();
        $periodEnd = now()->copy()->endOfMonth();
        $periodLabel = $periodMonths <= 1
            ? $periodEnd->translatedFormat('F Y')
            : sprintf('%s - %s', $periodStart->translatedFormat('F Y'), $periodEnd->translatedFormat('F Y'));

        // Total nominal yang sudah dibayar user untuk jenis iuran ini.
        $paidSum = (int) Iuran::query()
            ->where('user_id', $user->id)
            ->where('type', $type)
            ->where('paid', true)
            ->sum('amount');

        $paidThisPeriod = $paidSum >= $fixedAmount;
        $remaining = max(0, $fixedAmount - $paidSum);

        // Siapkan enam riwayat pembayaran terakhir untuk ditampilkan di halaman.
        $lastPayments = Iuran::query()
            ->where('user_id', $user->id)
            ->where('type', $type)
            ->orderByDesc('paid_at')
            ->take(6)
            ->get(['id', 'amount', 'paid_at', 'paid', 'proof_path'])
            ->map(fn ($i) => [
                'id' => $i->id,
                'amount' => (int) $i->amount,
                'paid_at' => optional($i->paid_at)->toISOString(),
                'paid' => (bool) $i->paid,
                'proof_path' => $i->proof_path,
                'proof_url' => $i->proof_url,
            ]);

        // Cari entri iuran yang masih menunggu bukti atau pembayaran.
        $pendingCandidate = Iuran::query()
            ->where('user_id', $user->id)
            ->where('type', $type)
            ->where(function ($q) {
                $q->where('paid', false)
                  ->orWhereNull('proof_path');
            })
            ->orderBy('paid')
            ->orderByDesc('paid_at')
            ->orderByDesc('updated_at')
            ->first();

        $pendingProof = null;
        if ($pendingCandidate) {
            $pendingProof = [
                'id' => $pendingCandidate->id,
                'paid_at' => optional($pendingCandidate->paid_at)->toISOString(),
                'proof_url' => $pendingCandidate->proof_url,
                'paid' => (bool) $pendingCandidate->paid,
            ];
        }

        return Inertia::render('Payment/Pay', [
            'type' => $type,
            'fixedAmount' => $fixedAmount,
            'paidThisPeriod' => $paidThisPeriod,
            'paidSum' => $paidSum,
            'remaining' => $remaining,
            'periodLabel' => $periodLabel,
            'lastPayments' => $lastPayments,
            'paymentPeriodMonths' => $periodMonths,
            'pendingProof' => $pendingProof,
        ]);
    }

    /**
     * Membuat transaksi Snap Midtrans untuk pembayaran iuran.
     */
    public function store(Request $request, string $type)
    {
        abort_unless(in_array($type, ['sampah', 'ronda'], true), 404);

        Iuran::expireStalePayments();

        $user = $request->user();
        $fixedAmount = Iuran::FIXED_AMOUNT;
        $periodMonths = Iuran::PAYMENT_PERIOD_MONTHS;

        $periodStart = now()->copy()->subMonthsNoOverflow(max(0, $periodMonths - 1))->startOfMonth();
        $periodEnd = now()->copy()->endOfMonth();
        $itemPeriodLabel = $periodMonths <= 1
            ? $periodEnd->format('M Y')
            : sprintf('%s - %s', $periodStart->format('M Y'), $periodEnd->format('M Y'));

        $request->validate([
            'amount' => ['required', 'integer', 'min:1000'],
        ]);

        // Konfigurasi kredensial Midtrans setiap kali request diterima.
        \Midtrans\Config::$serverKey = (string) config('midtrans.server_key');
        \Midtrans\Config::$isProduction = (bool) config('midtrans.is_production');
        \Midtrans\Config::$isSanitized = (bool) config('midtrans.is_sanitized');
        \Midtrans\Config::$is3ds = (bool) config('midtrans.is_3ds');

        // order_id maximum 50 karakter: format iuran-{jenis}-{user}-{random12} agar mudah dilacak.
        $orderId = sprintf('iuran-%s-%d-%s', $type, $user->id, \Illuminate\Support\Str::random(12));
        $grossAmount = $fixedAmount;
        $itemName = 'Iuran ' . ucfirst($type) . ' ' . $itemPeriodLabel;

        // Catat draft iuran sebelum diarahkan ke gateway pembayaran.
        Iuran::updateOrCreate(
            ['order_id' => $orderId],
            [
                'user_id' => $user->id,
                'type' => $type,
                'amount' => $grossAmount,
                'paid' => false,
                'paid_at' => null,
                'proof_path' => null,
            ]
        );

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $grossAmount,
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email' => $user->email,
            ],
            'item_details' => [[
                'id' => 'iuran-' . $type,
                'price' => $grossAmount,
                'quantity' => 1,
                'name' => $itemName,
            ]],
            'callbacks' => [
                'finish' => route('midtrans.finish'),
            ],
        ];

        // Log konteks request (tanpa data sensitif) agar mudah ditelusuri saat debug.
        Log::info('Midtrans createTransaction request', [
            'order_id' => $orderId,
            'order_id_len' => strlen($orderId),
            'type' => $type,
            'user_id' => $user->id,
            'gross_amount' => $grossAmount,
            'is_production' => (bool) config('midtrans.is_production'),
        ]);

        try {
            $transaction = \Midtrans\Snap::createTransaction($params);
            $redirectUrl = $transaction->redirect_url ?? null;
            $token = $transaction->token ?? null;
            $tokenHint = $token ? substr($token, -6) : null;

            Log::info('Midtrans createTransaction response', [
                'order_id' => $orderId,
                'redirect_url' => $redirectUrl,
                'token_hint' => $tokenHint,
            ]);
            if (!$redirectUrl) {
                return back()->with('message', 'Gagal membuat transaksi Midtrans.');
            }
            // Inertia::location menginstruksikan browser berpindah ke halaman pembayaran Midtrans.
            return \Inertia\Inertia::location($redirectUrl);
        } catch (\Throwable $e) {
            Log::error('Midtrans createTransaction failed', [
                'order_id' => $orderId,
                'error' => $e->getMessage(),
            ]);

            Iuran::where('order_id', $orderId)->delete();

            return back()->with('message', 'Gagal menginisiasi pembayaran: ' . $e->getMessage());
        }
    }

    /**
     * Menyimpan bukti transfer yang diunggah warga.
     */
    public function storeProof(Request $request, Iuran $iuran)
    {
        $user = $request->user();
        abort_unless($iuran->user_id === $user->id, 403);

        $data = $request->validate([
            'proof' => ['required', 'image', 'max:5120'],
        ]);

        if ($iuran->proof_path) {
            Storage::disk('public')->delete($iuran->proof_path);
        }

        // Simpan file bukti di disk publik lalu tandai iuran sebagai lunas.
        $path = $request->file('proof')->store('payment-proofs', 'public');
        $iuran->update([
            'proof_path' => $path,
            'paid' => true,
            'paid_at' => $iuran->paid_at ?? now(),
        ]);

        return back()->with('message', 'Bukti transfer berhasil diunggah.');
    }
}
