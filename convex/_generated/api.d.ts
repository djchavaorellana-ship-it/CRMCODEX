/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as catalog from "../catalog.js";
import type * as files from "../files.js";
import type * as followUps from "../followUps.js";
import type * as leads from "../leads.js";
import type * as misc from "../misc.js";
import type * as quotes from "../quotes.js";
import type * as sessions from "../sessions.js";
import type * as settings from "../settings.js";
import type * as timeline from "../timeline.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  catalog: typeof catalog;
  files: typeof files;
  followUps: typeof followUps;
  leads: typeof leads;
  misc: typeof misc;
  quotes: typeof quotes;
  sessions: typeof sessions;
  settings: typeof settings;
  timeline: typeof timeline;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
