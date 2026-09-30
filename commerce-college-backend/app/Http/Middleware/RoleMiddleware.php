<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (! $request->user() || ! in_array($request->user()->role, $roles)) {
            return response()->json(['message' => 'Forbidden. You do not have access to this resource.'], 403);
        }

        return $next($request);
    }
}
