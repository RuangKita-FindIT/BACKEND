import { Context } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";

export function responseUtils<T, M = any>(
  c: Context,
  message: string,
  status: ContentfulStatusCode,
  data?: T,
  meta?: M
) {
  if (status < 400) {
    return c.json(
      {
        code: status,
        success: true,
        message,
        data,
        meta,
      },
      status
    );
  } else {
    return c.json(
      {
        code: status,
        success: false,
        message,
        meta,
      },
      status
    );
  }
}
