<?php

namespace App\Models;

require dirname(__DIR__, 2) . "/vendor/autoload.php";
require dirname(__DIR__) . "/Models/Status.php";
require dirname(__DIR__) . "/Models/Pages.php";
require dirname(__DIR__) . "/Models/ContentType.php";

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ContentPage extends Model
{
    use HasFactory;

    /**
     * This function is used from add relationship between ContentPage and Page Model.
     * @return BelongsTo
     */
    public function page(): BelongsTo
    {
        return $this->belongsTo(Pages::class);
    }

    /**
     * This function is used from add relationship between ContentPage and ContentType Model.
     * @return BelongsTo
     */
    public function content_type(): BelongsTo
    {
        return $this->belongsTo(ContentType::class);
    }

    /**
     * This function is used from add relationship between ContentPage and Status Model.
     * @return BelongsTo
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(Status::class);
    }

    /**
     * @return HasMany
     */
    public function assets_by_content(): HasMany
    {
        return $this->hasMany(AssetsByContent::class);
    }
}