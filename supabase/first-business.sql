-- Talaqa · add a client business and its owner's sign-in.
-- Run after migrations/0001_init.sql and 0002_grants.sql, once per new client.
--
-- 1. Supabase dashboard → Authentication → Users → "Add user" → "Create new user":
--    the owner's email and a password, with "Auto Confirm User" ticked.
-- 2. Replace every value marked «…» below (keep the quotes), then run this in the SQL Editor.
--    If the email matches no user, nothing is inserted ("0 rows"): check the email and run again.
-- 3. The owner can now sign in at /ar/login or /en/login and sees only this business.

with owner as (
  select id from auth.users where email = '«owner@example.com»'
),
business as (
  insert into public.businesses (name_ar, name_en, category_ar, category_en)
  select '«اسم النشاط»', '«Business name»', '«صالون حلاقة»', '«Barbershop»'
  from owner
  returning id
),
branch as (
  insert into public.branches (business_id, name_ar, name_en, hours)
  select id, '«الفرع الرئيسي»', '«Main branch»',
         '[{"days":[6,0,1,2,3,4],"opens":"10:00","closes":"23:00"},{"days":[5],"opens":"16:00","closes":"23:00"}]'::jsonb
  from business
  returning id
)
insert into public.members (business_id, user_id, name_ar, name_en, role)
select business.id, owner.id, '«اسم المالك»', '«Owner name»', 'owner'
from business, owner;
