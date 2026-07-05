export function successResponse(data: unknown, status = 200): Response {
  return Response.json(
    { success: true, data },
    { status, headers: { "Content-Type": "application/json" } }
  );
}

export function errorResponse(
  code: string,
  message: string,
  status = 400,
  details?: unknown
): Response {
  return Response.json(
    { success: false, error: { code, message, details } },
    { status, headers: { "Content-Type": "application/json" } }
  );
}

export function paginatedResponse(
  data: unknown[],
  total: number,
  page: number,
  pageSize: number
): Response {
  return Response.json({
    success: true,
    data,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}
