<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentTransport;
use App\Models\TransportRoute;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class TransportController extends Controller
{
    // ===== Routes =====
    public function routes()
    {
        return TransportRoute::withCount(['vehicles', 'students'])->get();
    }

    public function storeRoute(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'stoppages' => ['nullable', 'string'],
            'fare_amount' => ['required', 'numeric', 'min:0'],
        ]);

        return response()->json(TransportRoute::create($data), 201);
    }

    public function destroyRoute(TransportRoute $route)
    {
        $route->delete();

        return response()->json(['message' => 'রুট মুছে ফেলা হয়েছে']);
    }

    // ===== Vehicles =====
    public function vehicles()
    {
        return Vehicle::with('route')->get();
    }

    public function storeVehicle(Request $request)
    {
        $data = $request->validate([
            'route_id' => ['nullable', 'exists:transport_routes,id'],
            'vehicle_number' => ['required', 'string', 'max:50'],
            'driver_name' => ['required', 'string', 'max:255'],
            'driver_phone' => ['nullable', 'string'],
            'capacity' => ['required', 'integer', 'min:1'],
        ]);

        return response()->json(Vehicle::create($data)->load('route'), 201);
    }

    public function destroyVehicle(Vehicle $vehicle)
    {
        $vehicle->delete();

        return response()->json(['message' => 'যানবাহন মুছে ফেলা হয়েছে']);
    }

    // ===== Student Assignment =====
    public function assignments()
    {
        return StudentTransport::with(['student', 'route', 'vehicle'])->get();
    }

    public function assignStudent(Request $request)
    {
        $data = $request->validate([
            'student_id' => ['required', 'exists:users,id'],
            'route_id' => ['required', 'exists:transport_routes,id'],
            'vehicle_id' => ['nullable', 'exists:vehicles,id'],
            'pickup_point' => ['nullable', 'string'],
        ]);

        $assignment = StudentTransport::updateOrCreate(
            ['student_id' => $data['student_id']],
            $data
        );

        return response()->json($assignment->load(['student', 'route', 'vehicle']), 201);
    }

    public function removeAssignment(StudentTransport $studentTransport)
    {
        $studentTransport->delete();

        return response()->json(['message' => 'বরাদ্দ বাতিল করা হয়েছে']);
    }

    // Student: own transport info
    public function myTransport(Request $request)
    {
        $assignment = StudentTransport::with(['route', 'vehicle'])
            ->where('student_id', $request->user()->id)
            ->first();

        return response()->json($assignment);
    }
}
