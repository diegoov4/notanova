create table
  public.locales_master (
    id serial,
    nombre text null,
    responsable text null,
    email character varying null,
    activo boolean not null default true,
    constraint locales_pkey primary key (id)
  ) tablespace pg_default;

create table
  public.clientes (
    id serial,
    nombre_cliente text null,
    id_local integer null,
    constraint clientes_pkey primary key (id),
    constraint clientes_id_local_fkey foreign key (id_local) references locales_master (id)
  ) tablespace pg_default;

create table
  public.mesas (
    id serial,
    nombre_mesa text null,
    id_local integer null,
    constraint mesas_pkey primary key (id),
    constraint mesas_id_local_fkey foreign key (id_local) references locales_master (id)
  ) tablespace pg_default;

CREATE TYPE comanda_status AS ENUM ('open', 'closed');
create table
  public.comandas (
    id serial,
    id_cliente integer null,
    id_mesa integer null,
    id_local integer null,
    status public.comanda_status null,
    created_at timestamp with time zone null default now(),
    constraint comandas_pkey primary key (id),
    constraint comandas_id_cliente_fkey foreign key (id_cliente) references clientes (id),
    constraint comandas_id_local_fkey foreign key (id_local) references locales_master (id),
    constraint comandas_id_mesa_fkey foreign key (id_mesa) references mesas (id)
  ) tablespace pg_default;


create table
  public.productos (
    id serial,
    titulo text null,
    imagen text null,
    precio numeric(10, 2) null,
    id_local integer null,
    constraint productos_pkey primary key (id),
    constraint productos_id_local_fkey foreign key (id_local) references locales_master (id)
  ) tablespace pg_default;
 
create table
  public.comandas_productos (
    id_comanda integer null,
    id_producto integer null,
    cantidad integer null,
    constraint comandas_productos_id_comanda_fkey foreign key (id_comanda) references comandas (id),
    constraint comandas_productos_id_producto_fkey foreign key (id_producto) references productos (id)
  ) tablespace pg_default;
