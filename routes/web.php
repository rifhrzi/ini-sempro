<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SemproController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\IuranController;
use App\Http\Controllers\UserIuranController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MidtransController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Make Dashboard the homepage with real data (controller-based)
Route::get('/', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    // Preserve old /dashboard URL by redirecting to the homepage (guarded)
    Route::get('/dashboard', function () {
        return redirect()->route('dashboard');
    });

    // Sempro create + store (RESTful minimal)
    Route::resource('sempro', SemproController::class)->only(['create', 'store']);
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Admin dashboard (auth + gate)
    Route::get('/admin/dashboard', AdminDashboardController::class)
        ->middleware('can:access-admin')
        ->name('admin.dashboard');

    // Admin Iuran CRUD
    Route::middleware('can:access-admin')->group(function () {
        Route::resource('/admin/iurans', IuranController::class)
            ->except(['show'])
            ->names('admin.iurans');
    });

    // User-facing payment routes
    Route::get('/iuran/pay/{type}', [UserIuranController::class, 'create'])
        ->whereIn('type', ['sampah', 'ronda'])
        ->name('iuran.pay.create');
    Route::post('/iuran/pay/{type}', [UserIuranController::class, 'store'])
        ->whereIn('type', ['sampah', 'ronda'])
        ->name('iuran.pay.store');
    Route::post('/iuran/proof/{iuran}', [UserIuranController::class, 'storeProof'])
        ->name('iuran.pay.proof');

    // Midtrans return URLs (no auth required in practice, but safe to allow access)
});

// Midtrans finish/unfinish/error redirects
Route::get('/payment/finish', [MidtransController::class, 'finish'])->name('midtrans.finish');
Route::get('/payment/unfinish', [MidtransController::class, 'unfinish'])->name('midtrans.unfinish');
Route::get('/payment/error', [MidtransController::class, 'error'])->name('midtrans.error');

require __DIR__.'/auth.php';
