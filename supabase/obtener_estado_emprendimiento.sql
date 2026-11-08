-- Flujo 2c · Estado del emprendimiento
-- Devuelve, en la forma que espera el frontend (EstadoEmprendimiento), lo que hay REALMENTE
-- guardado en Supabase: dolores (tabla dolores, la que llenan guardar_dolor / guardar_dolor_pendiente), etiquetas (categorías de problemas e items)
-- y la etapa (tabla emprendimientos). No inventa datos: si no hay dolores, devuelve [].

create or replace function obtener_estado_emprendimiento(p_emprendimiento_id int)
returns json
language sql
stable
security definer
as $$
  with e as (
    select
      id,
      nombre,
      etapa,
      (etapa in ('resumen_confirmado', 'aei', 'mvp', 'apm')) as confirmado
    from emprendimientos
    where id = p_emprendimiento_id
  ),
  cats as (
    select distinct '#' || trim(c.categoria) as tag
    from (
      select categoria from dolores
       where emprendimiento_id = p_emprendimiento_id and estado <> 'eliminado'
      union
      select categoria from items
       where emprendimiento_id = p_emprendimiento_id and estado <> 'eliminado'
    ) c
    where c.categoria is not null and trim(c.categoria) <> ''
  ),
  dol as (
    select
      p.*,
      row_number() over (order by p.score desc nulls last, p.id) as pos
    from dolores p
    where p.emprendimiento_id = p_emprendimiento_id
      and p.estado <> 'eliminado'
  )
  select json_build_object(
    'id',                   e.id::text,
    'nombreEmprendimiento', coalesce(e.nombre, ''),
    -- cualquier etapa anterior al resumen (p. ej. 'contextualizacion') se ve como "resumen por confirmar"
    'etapa',                case when e.confirmado then e.etapa else 'resumen_por_confirmar' end,
    'etiquetas',            coalesce((select json_agg(tag order by tag) from cats), '[]'::json),
    'dolores',              coalesce((
                              select json_agg(json_build_object(
                                'id',           d.id::text,
                                'nombre',       d.nombre,
                                'importancia',  d.importancia,
                                'satisfaccion', d.satisfaccion,
                                'score',        d.score,
                                'nivel',        d.nivel,
                                'cita',         d.cita,
                                'confianza',    coalesce(d.confianza, 'media'),
                                'estado',       case when e.confirmado or d.estado = 'confirmado' then 'confirmado' else 'por_confirmar' end,
                                'etiquetas',    case when d.categoria is not null and trim(d.categoria) <> ''
                                                     then json_build_array('#' || trim(d.categoria))
                                                     else '[]'::json end,
                                'tipoItem',     'estimacion'
                              ) order by d.pos)
                              from dol d
                            ), '[]'::json),
    'sugerencias',          coalesce((
                              select json_agg(json_build_object(
                                'id',                i.id::text,
                                'hipotesis',         i.texto,
                                'solucionPropuesta', i.texto,
                                'dolorAsociado',     coalesce(i.categoria, ''),
                                'estado',            'pendiente',
                                'origen',            'IA'
                              ) order by i.id)
                              from items i
                              where i.emprendimiento_id = e.id
                                and i.tipo = 'hipotesis'
                                and i.estado = 'sugerencia_ia'
                            ), '[]'::json),
    'notaMentor',               null,
    'estadoNotificacionMentor', 'no_iniciada',
    'resumenEstado', json_build_object(
      'confirmado',   case when e.confirmado then 'Resumen completo confirmado' else 'Nada confirmado todavía' end,
      'queCambio',    (select count(*) from dol)::text || ' dolor(es) detectado(s) por la IA',
      'esperaMentor', '',
      'proximaAccion', ''
    )
  )
  from e;
$$;

-- Solo la clave de servicio (la credencial MULTIAGENTE de Visione Flow) puede llamarla
revoke all on function obtener_estado_emprendimiento(int) from public, anon, authenticated;
grant execute on function obtener_estado_emprendimiento(int) to service_role;

-- Prueba rápida:
-- select obtener_estado_emprendimiento(1);
