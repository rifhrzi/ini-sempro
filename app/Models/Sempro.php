<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Sempro extends Model
{
    use HasFactory;

    /**
     * Kolom yang dapat diisi melalui mass-assignment.
     */
    protected $fillable = [
        'title',
        'description',
        'category',
        'author',
        'author_id',
    ];

    /**
     * Relasi ke akun pengguna yang mengajukan proposal.
     */
    public function authorUser()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
