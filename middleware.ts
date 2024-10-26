export { auth as middleware } from "./app/(admin)/api/auth/config";

export const config = {
  matcher: [
    "/((?!api/auth|!backoffice/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
