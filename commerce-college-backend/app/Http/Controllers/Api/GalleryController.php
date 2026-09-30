<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GalleryItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GalleryController extends Controller
{
    public function index(Request $request)
    {
        $query = GalleryItem::orderBy('sort_order', 'asc')->orderBy('id', 'desc');

        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->boolean('active_only')) {
            $query->where('is_active', true);
        }

        $items = $query->get();
        return response()->json(['data' => $items]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'image' => 'required_without:image_path|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'image_path' => 'nullable|string',
        ]);

        $imagePath = $request->input('image_path');
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('gallery', 'public');
        }

        $item = GalleryItem::create([
            'title' => $request->input('title'),
            'category' => $request->input('category', 'Campus'),
            'description' => $request->input('description'),
            'image_path' => $imagePath,
            'sort_order' => $request->input('sort_order', 0),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return response()->json([
            'message' => 'Gallery item added successfully',
            'data' => $item
        ], 201);
    }

    public function show(GalleryItem $gallery)
    {
        return response()->json(['data' => $gallery]);
    }

    public function update(Request $request, GalleryItem $gallery)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'image_path' => 'nullable|string',
        ]);

        $imagePath = $gallery->image_path;
        if ($request->hasFile('image')) {
            if ($gallery->image_path && Storage::disk('public')->exists($gallery->image_path)) {
                Storage::disk('public')->delete($gallery->image_path);
            }
            $imagePath = $request->file('image')->store('gallery', 'public');
        } elseif ($request->filled('image_path')) {
            $imagePath = $request->input('image_path');
        }

        $gallery->update([
            'title' => $request->input('title', $gallery->title),
            'category' => $request->input('category', $gallery->category),
            'description' => $request->has('description') ? $request->input('description') : $gallery->description,
            'image_path' => $imagePath,
            'sort_order' => $request->input('sort_order', $gallery->sort_order),
            'is_active' => $request->has('is_active') ? $request->boolean('is_active') : $gallery->is_active,
        ]);

        return response()->json([
            'message' => 'Gallery item updated successfully',
            'data' => $gallery
        ]);
    }

    public function destroy(GalleryItem $gallery)
    {
        if ($gallery->image_path && Storage::disk('public')->exists($gallery->image_path)) {
            Storage::disk('public')->delete($gallery->image_path);
        }
        $gallery->delete();
        return response()->json(['message' => 'Gallery item deleted successfully']);
    }
}
