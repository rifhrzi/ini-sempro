<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sempro extends Model
{
    use HasFactory;

    /**
     * Explicitly set the table name to match the migration (singular 'sempro').
     */
    protected $table = 'sempro';
}
