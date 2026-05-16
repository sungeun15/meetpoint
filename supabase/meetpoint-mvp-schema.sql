create extension if not exists pgcrypto;

create table
    if not exists public.users (
        id uuid primary key default gen_random_uuid (), -- 사용자 고유 식별자
        nickname varchar(12) not null, -- 화면에 표시되는 원본 닉네임
        nickname_normalized varchar(12) not null, -- 비교/중복 검사에 쓰는 정규화 닉네임
        password_hash text not null, -- 비밀번호 해시값
        lat double precision null, -- 마지막으로 공유한 위도
        lng double precision null, -- 마지막으로 공유한 경도
        location_updated_at timestamptz null, -- 마지막 위치 공유 시각
        created_at timestamptz not null default now (), -- 계정 생성 시각
        constraint users_nickname_normalized_key unique (nickname_normalized)
    );

create table
    if not exists public.friends (
        id uuid primary key default gen_random_uuid (), -- 친구 관계 고유 식별자
        user_id uuid not null, -- 관계 row의 주체 사용자 id
        friend_id uuid not null, -- 관계 상대 사용자 id
        status varchar(20) not null default 'accepted', -- 친구 요청 대기/수락 상태
        created_at timestamptz not null default now (), -- 친구 관계 생성 시각
        constraint friends_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade,
        constraint friends_friend_id_fkey foreign key (friend_id) references public.users (id) on delete cascade,
        constraint friends_user_friend_unique unique (user_id, friend_id),
        constraint friends_not_self check (user_id <> friend_id),
        constraint friends_status_check check (status in ('pending', 'accepted'))
    );

create table
    if not exists public.messages (
        id uuid primary key default gen_random_uuid (), -- 메시지 고유 식별자
        sender_id uuid not null, -- 메시지를 보낸 사용자 id
        receiver_id uuid not null, -- 메시지를 받은 사용자 id
        content varchar(500) not null, -- 메시지 본문
        created_at timestamptz not null default now (), -- 메시지 전송 시각
        constraint messages_sender_id_fkey foreign key (sender_id) references public.users (id) on delete cascade,
        constraint messages_receiver_id_fkey foreign key (receiver_id) references public.users (id) on delete cascade,
        constraint messages_content_not_blank check (char_length(btrim (content)) >= 1)
    );

create table
    if not exists public.departure_locations (
        id uuid primary key default gen_random_uuid (), -- 저장 위치 고유 식별자
        user_id uuid not null, -- 저장 위치를 소유한 사용자 id
        label varchar(100) not null, -- 사용자가 붙인 위치 이름
        lat double precision not null, -- 저장 위치의 위도
        lng double precision not null, -- 저장 위치의 경도
        location_kind varchar(20) not null default 'recent', -- 최근 위치인지 프리셋인지 구분
        last_used_at timestamptz not null default now (), -- 마지막 사용 시각
        created_at timestamptz not null default now (), -- 저장 위치 생성 시각
        updated_at timestamptz not null default now (), -- 저장 위치 수정 시각
        constraint departure_locations_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade,
        constraint departure_locations_kind_check check (location_kind in ('recent', 'preset')),
        constraint departure_locations_label_not_blank check (char_length(btrim (label)) >= 1)
    );

create index if not exists users_nickname_normalized_idx on public.users (nickname_normalized);

create index if not exists users_location_updated_at_idx on public.users (location_updated_at);

create index if not exists friends_user_id_idx on public.friends (user_id);

create index if not exists friends_friend_id_idx on public.friends (friend_id);

create index if not exists friends_user_status_idx on public.friends (user_id, status);

create index if not exists friends_friend_status_idx on public.friends (friend_id, status);

create index if not exists messages_sender_receiver_created_at_idx on public.messages (sender_id, receiver_id, created_at);

create index if not exists messages_receiver_sender_created_at_idx on public.messages (receiver_id, sender_id, created_at);

create index if not exists departure_locations_user_last_used_at_idx on public.departure_locations (user_id, last_used_at desc);

create index if not exists departure_locations_user_kind_idx on public.departure_locations (user_id, location_kind);

create or replace function public.accept_friend_request_atomic(
        input_request_id uuid,
        input_current_user_id uuid
)
returns table(request_id uuid, requester_id uuid)
language plpgsql
as $$
declare
        pending_request public.friends%rowtype;
begin
        select *
        into pending_request
        from public.friends
        where id = input_request_id
            and friend_id = input_current_user_id
            and status = 'pending'
        for update;

        if not found then
                return;
        end if;

        update public.friends
        set status = 'accepted'
        where id = pending_request.id
            and status = 'pending';

        insert into public.friends (user_id, friend_id, status)
        values (input_current_user_id, pending_request.user_id, 'accepted')
        on conflict (user_id, friend_id)
        do update set status = excluded.status;

        request_id := pending_request.id;
        requester_id := pending_request.user_id;

        return next;
end;
$$;