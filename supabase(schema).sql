-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.cached_bookings (
  id bigint NOT NULL,
  property_id bigint,
  api_source text,
  channel text,
  status text,
  arrival_date date,
  departure_date date,
  total_nights integer,
  num_adult integer,
  num_child integer,
  first_name text,
  last_name text,
  email text,
  phone text,
  mobile text,
  price numeric,
  commission numeric,
  booking_time timestamp without time zone,
  modified_time timestamp without time zone,
  data jsonb NOT NULL,
  updated_at timestamp without time zone DEFAULT now(),
  remarks text,
  check_in text,
  paid text,
  CONSTRAINT cached_bookings_pkey PRIMARY KEY (id),
  CONSTRAINT cached_bookings_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id)
);
CREATE TABLE public.properties (
  id bigint NOT NULL,
  name text,
  property_type text,
  address text,
  city text,
  country text,
  postcode text,
  phone text,
  mobile text,
  fax text,
  email text,
  email_lc text,
  web text,
  contact_first_name text,
  contact_last_name text,
  checkin_start text,
  checkin_end text,
  checkout_end text,
  offer_type text,
  sell_priority integer,
  control_priority integer,
  room_charge_display text,
  data jsonb NOT NULL,
  updated_at timestamp without time zone DEFAULT now(),
  detail text,
  CONSTRAINT properties_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_property_access (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint,
  property_id bigint,
  CONSTRAINT user_property_access_pkey PRIMARY KEY (id),
  CONSTRAINT user_property_access_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_property_access_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id)
);
CREATE TABLE public.users (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  email text NOT NULL DEFAULT 'NULL'::text,
  role text DEFAULT 'NULL'::text,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);