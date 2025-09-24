<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Sempro extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'title',
        'description',
        'category',
        'author',
        'author_id',
    ];

    /**
     * Author user relationship.
     */
    public function authorUser()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
