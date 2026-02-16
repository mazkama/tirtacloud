<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Reads Bearer token from ?token= query parameter.
 * Required for file preview/streaming endpoints where
 * the browser embeds the URL directly (img src, video src, iframe src)
 * and cannot set Authorization headers.
 */
class TokenFromQuery
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->has('token') && !$request->bearerToken()) {
            $request->headers->set('Authorization', 'Bearer ' . $request->query('token'));
        }

        return $next($request);
    }
}
