<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::orderBy('event_date', 'desc')->orderBy('id', 'desc');

        if ($request->boolean('active_only')) {
            $query->where('is_active', true);
        }

        $events = $query->get();
        return response()->json(['data' => $events]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_date' => 'nullable|date',
            'location' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'image_path' => 'nullable|string',
        ]);

        $imagePath = $request->input('image_path');
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('events', 'public');
        }

        $event = Event::create([
            'title' => $request->title,
            'description' => $request->description,
            'event_date' => $request->event_date,
            'location' => $request->location,
            'image_path' => $imagePath,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return response()->json([
            'message' => 'Event created successfully',
            'data' => $event
        ], 201);
    }

    public function show(Event $event)
    {
        return response()->json(['data' => $event]);
    }

    public function update(Request $request, Event $event)
    {
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'event_date' => 'nullable|date',
            'location' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'image_path' => 'nullable|string',
        ]);

        $imagePath = $event->image_path;
        if ($request->hasFile('image')) {
            if ($event->image_path && Storage::disk('public')->exists($event->image_path)) {
                Storage::disk('public')->delete($event->image_path);
            }
            $imagePath = $request->file('image')->store('events', 'public');
        } elseif ($request->filled('image_path')) {
            $imagePath = $request->input('image_path');
        }

        $event->update([
            'title' => $request->input('title', $event->title),
            'description' => $request->input('description', $event->description),
            'event_date' => $request->input('event_date', $event->event_date),
            'location' => $request->input('location', $event->location),
            'image_path' => $imagePath,
            'is_active' => $request->has('is_active') ? $request->boolean('is_active') : $event->is_active,
        ]);

        return response()->json([
            'message' => 'Event updated successfully',
            'data' => $event
        ]);
    }

    public function destroy(Event $event)
    {
        if ($event->image_path && Storage::disk('public')->exists($event->image_path)) {
            Storage::disk('public')->delete($event->image_path);
        }
        $event->delete();
        return response()->json(['message' => 'Event deleted successfully']);
    }
}
