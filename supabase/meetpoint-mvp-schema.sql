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
        location_share_scope varchar(20) null, -- 현재 위치 공유 범위
        location_share_target_user_id uuid null, -- friend 범위일 때 공유 대상 친구 id
        created_at timestamptz not null default now (), -- 계정 생성 시각
        constraint users_nickname_normalized_key unique (nickname_normalized),
        constraint users_location_share_scope_check check (location_share_scope in ('friend', 'all_friends')),
        constraint users_location_share_target_user_id_fkey foreign key (location_share_target_user_id) references public.users (id) on delete set null
    );

alter table public.users
    add column if not exists location_share_scope varchar(20) null;

alter table public.users
    add column if not exists location_share_target_user_id uuid null;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conrelid = 'public.users'::regclass
            and conname = 'users_location_share_scope_check'
    ) then
        alter table public.users
            add constraint users_location_share_scope_check
            check (location_share_scope in ('friend', 'all_friends'));
    end if;

    if not exists (
        select 1
        from pg_constraint
        where conrelid = 'public.users'::regclass
            and conname = 'users_location_share_target_user_id_fkey'
    ) then
        alter table public.users
            add constraint users_location_share_target_user_id_fkey
            foreign key (location_share_target_user_id)
            references public.users (id)
            on delete set null;
    end if;
end;
$$;

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
        read_at timestamptz null, -- 수신자가 메시지를 읽은 시각
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
        address text null, -- 저장 당시 확정된 주소 문자열
        lat double precision not null, -- 저장 위치의 위도
        lng double precision not null, -- 저장 위치의 경도
        owner_party varchar(20) not null default 'me', -- 저장 위치가 내 출발지용인지 친구 출발지용인지 구분
        friend_id uuid null, -- 친구 출발지용일 때 대상 친구 id
        friend_nickname varchar(100) null, -- 친구 출발지용일 때 대상 친구 닉네임 스냅샷
        location_kind varchar(20) not null default 'recent', -- 최근 위치인지 프리셋인지 구분
        is_selected boolean not null default false, -- 현재 그룹에서 선택된 저장 위치인지 여부
        last_used_at timestamptz not null default now (), -- 마지막 사용 시각
        created_at timestamptz not null default now (), -- 저장 위치 생성 시각
        updated_at timestamptz not null default now (), -- 저장 위치 수정 시각
        constraint departure_locations_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade,
        constraint departure_locations_friend_id_fkey foreign key (friend_id) references public.users (id) on delete set null,
        constraint departure_locations_owner_party_check check (owner_party in ('me', 'friend')),
        constraint departure_locations_kind_check check (location_kind in ('recent', 'preset')),
        constraint departure_locations_friend_metadata_check check (
            (owner_party = 'me' and friend_id is null and friend_nickname is null)
            or (owner_party = 'friend' and friend_id is not null and char_length(btrim (friend_nickname)) >= 1)
        ),
        constraint departure_locations_label_not_blank check (char_length(btrim (label)) >= 1)
    );

alter table public.departure_locations
    add column if not exists owner_party varchar(20) not null default 'me';

alter table public.departure_locations
    add column if not exists friend_id uuid null;

alter table public.departure_locations
    add column if not exists friend_nickname varchar(100) null;

alter table public.departure_locations
    add column if not exists address text null;

alter table public.departure_locations
    add column if not exists is_selected boolean not null default false;

-- 기존 row 마이그레이션: owner/friend 메타를 제약 조건 기준으로 정규화한다.
update public.departure_locations
set owner_party = 'me'
where owner_party is null
     or owner_party not in ('me', 'friend');

-- me 소유 row 는 friend 메타를 비워 둔다.
update public.departure_locations
set friend_id = null,
        friend_nickname = null
where owner_party = 'me'
    and (friend_id is not null or friend_nickname is not null);

-- friend 소유 row 중 닉네임이 비어 있으면 users 닉네임으로 보완한다.
update public.departure_locations as d
set friend_nickname = u.nickname
from public.users as u
where d.owner_party = 'friend'
    and d.friend_id = u.id
    and (d.friend_nickname is null or btrim(d.friend_nickname) = '');

-- friend 소유인데 필수 메타가 비어 있는 row 는 임시로 me 소유로 복구한다.
update public.departure_locations
set owner_party = 'me',
        friend_id = null,
        friend_nickname = null
where owner_party = 'friend'
    and (
        friend_id is null
        or friend_nickname is null
        or btrim(friend_nickname) = ''
    );

with ranked_departure_locations as (
    select
        id,
        row_number() over (
            partition by user_id, owner_party, coalesce(friend_id, user_id)
            order by location_kind asc, last_used_at desc, created_at desc
        ) as selection_rank
    from public.departure_locations
)
update public.departure_locations as departure
set is_selected = ranked_departure_locations.selection_rank = 1
from ranked_departure_locations
where departure.id = ranked_departure_locations.id;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'departure_locations_owner_party_check'
    ) then
        alter table public.departure_locations
            add constraint departure_locations_owner_party_check check (owner_party in ('me', 'friend'));
    end if;

    if not exists (
        select 1
        from pg_constraint
        where conname = 'departure_locations_friend_metadata_check'
    ) then
        alter table public.departure_locations
            add constraint departure_locations_friend_metadata_check check (
                (owner_party = 'me' and friend_id is null and friend_nickname is null)
                or (owner_party = 'friend' and friend_id is not null and char_length(btrim (friend_nickname)) >= 1)
            );
    end if;

    if not exists (
        select 1
        from pg_constraint
        where conname = 'departure_locations_address_not_blank_check'
    ) then
        alter table public.departure_locations
            add constraint departure_locations_address_not_blank_check check (
                address is null or char_length(btrim (address)) >= 1
            );
    end if;
end $$;

create index if not exists users_nickname_normalized_idx on public.users (nickname_normalized);

create index if not exists users_location_updated_at_idx on public.users (location_updated_at);

create index if not exists users_location_share_scope_idx on public.users (location_share_scope, location_share_target_user_id);

create index if not exists friends_user_id_idx on public.friends (user_id);

create index if not exists friends_friend_id_idx on public.friends (friend_id);

create index if not exists friends_user_status_idx on public.friends (user_id, status);

create index if not exists friends_friend_status_idx on public.friends (friend_id, status);

create index if not exists messages_sender_receiver_created_at_idx on public.messages (sender_id, receiver_id, created_at);

create index if not exists messages_receiver_sender_created_at_idx on public.messages (receiver_id, sender_id, created_at);

create index if not exists messages_receiver_sender_read_at_idx on public.messages (receiver_id, sender_id, read_at);

create index if not exists departure_locations_user_last_used_at_idx on public.departure_locations (user_id, last_used_at desc);

create index if not exists departure_locations_user_kind_idx on public.departure_locations (user_id, location_kind);

create index if not exists departure_locations_user_friend_idx on public.departure_locations (user_id, owner_party, friend_id, last_used_at desc);

create index if not exists departure_locations_user_selected_idx on public.departure_locations (user_id, owner_party, friend_id, is_selected);

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

create or replace function public.remove_friend_relation_atomic(
    input_user_id uuid,
    input_friend_user_id uuid
)
returns boolean
language plpgsql
as $$
declare
    has_relation boolean;
begin
    -- 메시지 삭제와 친구 관계 삭제를 한 함수에서 묶어 중간 실패 시 부분 삭제를 막는다.
    select exists(
        select 1
        from public.friends
        where status = 'accepted'
            and (
            (user_id = input_user_id and friend_id = input_friend_user_id)
            or (user_id = input_friend_user_id and friend_id = input_user_id)
            )
    )
    into has_relation;

    if not has_relation then
        return false;
    end if;

    delete from public.messages
    where (sender_id = input_user_id and receiver_id = input_friend_user_id)
        or (sender_id = input_friend_user_id and receiver_id = input_user_id);

    delete from public.friends
    where status = 'accepted'
        and user_id in (input_user_id, input_friend_user_id)
        and friend_id in (input_user_id, input_friend_user_id);

    return true;
end;
$$;