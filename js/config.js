/* Online play settings. The publishable key is meant to live in the browser; it can only call the functions in supabase/setup.sql.
   Matches are relayed through Supabase Realtime. NET_MS = how often (ms) each player's updates are sent (lower = smoother but uses more of
   Supabase's per-second message cap; Free allows 100 messages/s, Pro 500). */
window.BB_CONFIG={
 SUPABASE_URL:'https://fnkyeacxrpwfmrhxdxik.supabase.co',
 SUPABASE_KEY:'sb_publishable_axpBKDDdcRcopgkCubtDeA_13ivSVCQ',
 NET_MS:100};
