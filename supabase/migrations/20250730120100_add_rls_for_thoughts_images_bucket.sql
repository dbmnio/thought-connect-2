CREATE POLICY "Allow authenticated users to upload to thoughts-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'thoughts-images' ); 