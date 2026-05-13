create extension if not exists pgcrypto;

create table
    if not exists public.users (
        id uuid primary key default gen_random_uuid (),
        nickname varchar(12) not null,
        nickname_normalized varchar(12) not null,
        password_hash text not null,
        lat double precision null,
        lng double precision null,
        location_updated_at timestamptz null,
        created_at timestamptz not null default now (),
        constraint users_nickname_normalized_key unique (nickname_normalized)
    );

create table
    if not exists public.friends (
        id uuid primary key default gen_random_uuid (),
        user_id uuid not null,
        friend_id uuid not null,
        created_at timestamptz not null default now (),
        constraint friends_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade,
        constraint friends_friend_id_fkey foreign key (friend_id) references public.users (id) on delete cascade,
        constraint friends_user_friend_unique unique (user_id, friend_id),
        constraint friends_not_self check (user_id <> friend_id)
    );

create table
    if not exists public.messages (
        id uuid primary key default gen_random_uuid (),
        sender_id uuid not null,
        receiver_id uuid not null,
        content varchar(500) not null,
        created_at timestamptz not null default now (),
        constraint messages_sender_id_fkey foreign key (sender_id) references public.users (id) on delete cascade,
        constraint messages_receiver_id_fkey foreign key (receiver_id) references public.users (id) on delete cascade,
        constraint messages_content_not_blank check (char_length(btrim (content)) >= 1)
    );

create table
    if not exists public.departure_locations (
        id uuid primary key default gen_random_uuid (),
        user_id uuid not null,
        label varchar(100) not null,
        lat double precision not null,
        lng double precision not null,
        location_kind varchar(20) not null default 'recent',
        last_used_at timestamptz not null default now (),
        created_at timestamptz not null default now (),
        updated_at timestamptz not null default now (),
        constraint departure_locations_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade,
        constraint departure_locations_kind_check check (location_kind in ('recent', 'preset')),
        constraint departure_locations_label_not_blank check (char_length(btrim (label)) >= 1)
    );

create index if not exists users_nickname_normalized_idx on public.users (nickname_normalized);

create index if not exists users_location_updated_at_idx on public.users (location_updated_at);

create index if not exists friends_user_id_idx on public.friends (user_id);

create index if not exists friends_friend_id_idx on public.friends (friend_id);

create index if not exists messages_sender_receiver_created_at_idx on public.messages (sender_id, receiver_id, created_at);

create index if not exists messages_receiver_sender_created_at_idx on public.messages (receiver_id, sender_id, created_at);

create index if not exists departure_locations_user_last_used_at_idx on public.departure_locations (user_id, last_used_at desc);

create index if not exists departure_locations_user_kind_idx on public.departure_locations (user_id, location_kind);