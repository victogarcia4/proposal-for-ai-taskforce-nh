// Power BI: create parameters SupabaseHost and SupabaseDatabase (usually postgres).
// Use the session-pooler endpoint supplied by Supabase for IPv4 networks.
// Authenticate with a dedicated LOGIN account granted nh_bi_reader only.
let
    Source = PostgreSQL.Database(SupabaseHost, SupabaseDatabase, [CreateNavigationProperties=false]),
    Metrics = Source{[Schema="nh_analytics", Item="metrics"]}[Data],
    Typed = Table.TransformColumnTypes(Metrics, {{"page", type text}, {"dimension", type text}, {"label", type text}, {"value", Int64.Type}, {"suppressed", type logical}, {"denominator", Int64.Type}, {"refreshed_at", type datetimezone}})
in
    Typed
