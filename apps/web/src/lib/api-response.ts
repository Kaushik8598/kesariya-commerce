import { NextResponse } from "next/server";

export type ApiError = {
  message: string;
  statusCode: number;
};

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export function unauthorizedResponse(
  message = "Unauthorized"
) {
  return NextResponse.json(
    { success: false, message },
    { status: 401 }
  );
}

export function notFoundResponse(message = "Not found") {
  return NextResponse.json(
    { success: false, message },
    { status: 404 }
  );
}

export function conflictResponse(message = "Conflict") {
  return NextResponse.json(
    { success: false, message },
    { status: 409 }
  );
}

export function serverErrorResponse(message = "Internal server error") {
  return NextResponse.json(
    { success: false, message },
    { status: 500 }
  );
}

/** Parse pagination params from URL */
export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.max(
    1,
    Math.min(100, parseInt(searchParams.get("limit") || "10"))
  );
  return { page, limit };
}
