import { auth } from "@/config/better-auth/auth";
import { toNextJsHandler } from "better-auth/next-js";


export const { GET, POST } = toNextJsHandler(auth.handler);
