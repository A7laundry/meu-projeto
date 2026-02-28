-- Garantir que os buckets existam
INSERT INTO storage.buckets (id, name, public) VALUES ('order-photos', 'order-photos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('delivery-photos', 'delivery-photos', true) ON CONFLICT (id) DO NOTHING;

-- Permitir upload por usuários autenticados
CREATE POLICY "Authenticated users can upload order photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'order-photos');

CREATE POLICY "Authenticated users can upload delivery photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'delivery-photos');

-- Leitura pública (buckets já são públicos, mas policies garantem)
CREATE POLICY "Public read order photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'order-photos');

CREATE POLICY "Public read delivery photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'delivery-photos');
