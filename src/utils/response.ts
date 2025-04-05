import { Context } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";

export function responseUtils<T>(
  c: Context,
  message: string,
  status: ContentfulStatusCode,
  data?: T
) {
  if (status < 400) {
    return c.json({ code: status, success: true, message, data }, status);
  } else {
    return c.json({ code: status, success: false, message }, status);
  }
}
