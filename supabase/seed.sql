--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
        ('00000000-0000-0000-0000-000000000000', '74aa0adc-8d44-4b60-bf26-d4ca39d1b491', 'authenticated', 'authenticated', 'test@mynextsaas.com', '$2a$10$4eek5uyhNzK.Q0W2FjAzCuHfZadD09f8I0ss6IhhukpKXyi/5uKau', '2024-04-20 08:20:38.165331+00', NULL, '', NULL, '', NULL, '', '', NULL, '2024-04-20 09:36:02.521776+00', '{"provider": "email", "providers": ["email"], "role": "super-admin"}', '{"sub": "74aa0adc-8d44-4b60-bf26-d4ca39d1b491", "email": "test@mynextsaas.com", "email_verified": true, "phone_verified": false, "full_name": "Test User", "avatar_url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXIiPjxwYXRoIGQ9Ik0xOSAyMXYtMmE0IDQgMCAwIDAtNC00SDlhNCA0IDAgMCAwLTQgNHYyIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ii8+PC9zdmc+"}', NULL, '2024-04-20 08:20:34.459113+00', '2024-04-20 10:07:48.554125+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false); -- password: password123

--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
  ('74aa0adc-8d44-4b60-bf26-d4ca39d1b491', '74aa0adc-8d44-4b60-bf26-d4ca39d1b491', '{"sub": "74aa0adc-8d44-4b60-bf26-d4ca39d1b491", "email": "test@mynextsaas.com", "email_verified": false, "phone_verified": false}', 'email', '2024-04-20 08:20:34.46275+00', '2024-04-20 08:20:34.462773+00', '2024-04-20 08:20:34.462773+00', '65f3a05e-4e88-4613-81bd-9131cbdb2d95');
