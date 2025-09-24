<?php

namespace App\Http\Controllers;

use App\Models\Iuran;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        Iuran::expireStalePayments();

        $target = (int) env('DASHBOARD_MONTHLY_TARGET', 5_000_000);

        $start = Carbon::now()->startOfMonth();
        $end = (clone $start)->endOfMonth();

        // Count families as users who have signed in at least once
        $familiesCount = (int) User::query()->whereNotNull('last_login_at')->count();
        $collected = (int) Iuran::query()
            ->whereNotNull('paid_at')
            ->whereBetween('paid_at', [$start, $end])
            ->sum('amount');

        $user = $request->user();
        $trashPaid = false;
        $rondaPaid = false;

        if ($user) {
            $trashPaid = Iuran::query()
                ->where('user_id', $user->id)
                ->where('type', 'sampah')
                ->where('paid', true)
                ->exists();

            $rondaPaid = Iuran::query()
                ->where('user_id', $user->id)
                ->where('type', 'ronda')
                ->where('paid', true)
                ->exists();
        }

        return Inertia::render('Dashboard', [
            'dashboard' => [
                'collected' => $collected,
                'target' => $target,
                'familiesCount' => $familiesCount,
                'trashPaid' => $trashPaid,
                'rondaPaid' => $rondaPaid,
                'paymentPeriodMonths' => Iuran::PAYMENT_PERIOD_MONTHS,
                'fixedAmount' => Iuran::FIXED_AMOUNT,
            ],
        ]);
    }
}

