-- Run this migration in Supabase SQL editor

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  category text not null default 'burger',
  base_price numeric(10,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,
  price_adjustment numeric(10,2) not null default 0
);

create table if not exists sale_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete set null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(10,2) not null,
  sale_date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table products enable row level security;
alter table product_variants enable row level security;
alter table sale_items enable row level security;

create policy "owners can manage products"
  on products for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "owners can manage product variants"
  on product_variants for all
  using (
    exists (select 1 from products where products.id = product_variants.product_id and products.user_id = auth.uid())
  )
  with check (
    exists (select 1 from products where products.id = product_variants.product_id and products.user_id = auth.uid())
  );

create policy "owners can manage sale items"
  on sale_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
