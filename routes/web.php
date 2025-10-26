<?php
// Membuka tag PHP agar file ini diproses sebagai script

use App\Http\Controllers\ProfileController;
// Mengimpor controller profil untuk rute manajemen profil
use App\Http\Controllers\SemproController;
// Mengimpor controller Sempro untuk rute proposal
use Illuminate\Support\Facades\Route;
// Mengimpor facade Route untuk mendefinisikan rute web
use App\Http\Controllers\AdminDashboardController;
// Mengimpor controller dashboard admin
use App\Http\Controllers\IuranController;
// Mengimpor controller iuran untuk rute admin
use App\Http\Controllers\UserIuranController;
// Mengimpor controller iuran versi pengguna
use App\Http\Controllers\DashboardController;
// Mengimpor controller dashboard utama
use App\Http\Controllers\MidtransController;
// Mengimpor controller Midtrans untuk menangani callback pembayaran

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
Route::get('/', [DashboardController::class, 'index']) // Menjadikan dashboard controller sebagai halaman utama
    ->middleware(['auth', 'verified']) // Membatasi akses ke pengguna yang sudah login dan terverifikasi
    ->name('dashboard'); // Memberi nama rute untuk referensi cepat

Route::middleware('auth')->group(function () { // Membuat grup rute yang membutuhkan autentikasi
    // Preserve old /dashboard URL by redirecting to the homepage (guarded)
    Route::get('/dashboard', function () { // Mendefinisikan rute lama /dashboard sebagai closure
        return redirect()->route('dashboard'); // Mengarahkan ke rute dashboard utama
    });

    // Sempro create + store (RESTful minimal)
    Route::resource('sempro', SemproController::class)->only(['create', 'store']); // Membatasi resource Sempro hanya untuk create dan store
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit'); // Rute untuk menampilkan form edit profil
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update'); // Rute untuk memperbarui data profil
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy'); // Rute untuk menghapus akun profil

    // Admin dashboard (auth + gate)
    Route::get('/admin/dashboard', AdminDashboardController::class) // Rute dashboard admin berbasis single action controller
        ->middleware('can:access-admin') // Membatasi akses hanya untuk user dengan izin admin
        ->name('admin.dashboard'); // Memberi nama rute dashboard admin

    // Admin Iuran CRUD
    Route::middleware('can:access-admin')->group(function () { // Grup rute admin iuran yang memerlukan izin admin
        Route::get('/admin/iurans/{iuran}/proof', [IuranController::class, 'proof']) // Rute untuk melihat bukti pembayaran iuran
            ->name('admin.iurans.proof'); // Memberi nama rute bukti iuran admin

        Route::resource('/admin/iurans', IuranController::class) // Resource controller untuk CRUD iuran admin
            ->except(['show']) // Menghapus aksi show karena tidak diperlukan
            ->names('admin.iurans'); // Mengatur prefix nama rute resource menjadi admin.iurans
    });

    // User-facing payment routes
    Route::get('/iuran/pay/{type}', [UserIuranController::class, 'create']) // Form pembayaran iuran berdasarkan jenis
        ->whereIn('type', ['sampah', 'ronda']) // Membatasi parameter type hanya ke sampah atau ronda
        ->name('iuran.pay.create'); // Memberi nama rute form pembayaran iuran
    Route::post('/iuran/pay/{type}', [UserIuranController::class, 'store']) // Menyimpan pembayaran iuran yang dikirim user
        ->whereIn('type', ['sampah', 'ronda']) // Membatasi jenis iuran yang valid
        ->name('iuran.pay.store'); // Memberi nama rute penyimpanan pembayaran iuran
    Route::post('/iuran/proof/{iuran}', [UserIuranController::class, 'storeProof']) // Menyimpan bukti pembayaran iuran
        ->name('iuran.pay.proof'); // Memberi nama rute unggah bukti pembayaran

    // Midtrans return URLs (no auth required in practice, but safe to allow access)
}); // Menutup grup rute yang membutuhkan autentikasi

// Midtrans finish/unfinish/error redirects
Route::get('/payment/finish', [MidtransController::class, 'finish'])->name('midtrans.finish'); // Menangani callback sukses pembayaran
Route::get('/payment/unfinish', [MidtransController::class, 'unfinish'])->name('midtrans.unfinish'); // Menangani callback pembayaran belum selesai
Route::get('/payment/error', [MidtransController::class, 'error'])->name('midtrans.error'); // Menangani callback pembayaran gagal

require __DIR__.'/auth.php'; // Memuat definisi rute autentikasi tambahan
