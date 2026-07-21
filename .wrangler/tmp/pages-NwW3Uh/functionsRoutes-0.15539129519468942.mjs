import { onRequestOptions as __api_enps_js_onRequestOptions } from "/Users/bduarte/AI-Netflix/functions/api/enps.js"
import { onRequestPost as __api_enps_js_onRequestPost } from "/Users/bduarte/AI-Netflix/functions/api/enps.js"
import { onRequestGet as __api_enps_list_js_onRequestGet } from "/Users/bduarte/AI-Netflix/functions/api/enps-list.js"
import { onRequestOptions as __api_enps_list_js_onRequestOptions } from "/Users/bduarte/AI-Netflix/functions/api/enps-list.js"
import { onRequestOptions as __api_progress_js_onRequestOptions } from "/Users/bduarte/AI-Netflix/functions/api/progress.js"
import { onRequestPost as __api_progress_js_onRequestPost } from "/Users/bduarte/AI-Netflix/functions/api/progress.js"
import { onRequestOptions as __api_register_js_onRequestOptions } from "/Users/bduarte/AI-Netflix/functions/api/register.js"
import { onRequestPost as __api_register_js_onRequestPost } from "/Users/bduarte/AI-Netflix/functions/api/register.js"
import { onRequestGet as __api_users_js_onRequestGet } from "/Users/bduarte/AI-Netflix/functions/api/users.js"
import { onRequestOptions as __api_users_js_onRequestOptions } from "/Users/bduarte/AI-Netflix/functions/api/users.js"

export const routes = [
    {
      routePath: "/api/enps",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_enps_js_onRequestOptions],
    },
  {
      routePath: "/api/enps",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_enps_js_onRequestPost],
    },
  {
      routePath: "/api/enps-list",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_enps_list_js_onRequestGet],
    },
  {
      routePath: "/api/enps-list",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_enps_list_js_onRequestOptions],
    },
  {
      routePath: "/api/progress",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_progress_js_onRequestOptions],
    },
  {
      routePath: "/api/progress",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_progress_js_onRequestPost],
    },
  {
      routePath: "/api/register",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_register_js_onRequestOptions],
    },
  {
      routePath: "/api/register",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_register_js_onRequestPost],
    },
  {
      routePath: "/api/users",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_users_js_onRequestGet],
    },
  {
      routePath: "/api/users",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_users_js_onRequestOptions],
    },
  ]