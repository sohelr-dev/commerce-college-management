<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    public function index()
    {
        $banners = Banner::orderBy('sort_order', 'asc')->orderBy('id', 'desc')->get();
        return response()->json(['data' => $banners]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'button_text' => 'nullable|string|max:100',
            'button_link' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'image' => 'required_without:image_path|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'image_path' => 'nullable|string',
        ]);

        $imagePath = $request->input('image_path');
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('banners', 'public');
        }

        $banner = Banner::create([
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'image_path' => $imagePath,
            'button_text' => $request->input('button_text'),
            'button_link' => $request->input('button_link'),
            'sort_order' => $request->input('sort_order', 0),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return response()->json([
            'message' => 'Banner created successfully',
            'data' => $banner
        ], 201);
    }

    public function show(Banner $banner)
    {
        return response()->json(['data' => $banner]);
    }

    public function update(Request $request, Banner $banner)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'button_text' => 'nullable|string|max:100',
            'button_link' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'image_path' => 'nullable|string',
        ]);

        $imagePath = $banner->image_path;
        if ($request->hasFile('image')) {
            if ($banner->image_path && Storage::disk('public')->exists($banner->image_path)) {
                Storage::disk('public')->delete($banner->image_path);
            }
            $imagePath = $request->file('image')->store('banners', 'public');
        } elseif ($request->filled('image_path')) {
            $imagePath = $request->input('image_path');
        }

        $banner->update([
            'title' => $request->input('title', $banner->title),
            'description' => $request->input('description', $banner->description),
            'image_path' => $imagePath,
            'button_text' => $request->input('button_text', $banner->button_text),
            'button_link' => $request->input('button_link', $banner->button_link),
            'sort_order' => $request->input('sort_order', $banner->sort_order),
            'is_active' => $request->has('is_active') ? $request->boolean('is_active') : $banner->is_active,
        ]);

        return response()->json([
            'message' => 'Banner updated successfully',
            'data' => $banner
        ]);
    }

    public function destroy(Banner $banner)
    {
        if ($banner->image_path && Storage::disk('public')->exists($banner->image_path)) {
            Storage::disk('public')->delete($banner->image_path);
        }
        $banner->delete();
        return response()->json(['message' => 'Banner deleted successfully']);
    }
}
