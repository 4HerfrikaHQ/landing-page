INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mentor-avatars',
  'mentor-avatars',
  true,
  5242880,
  '{image/jpeg,image/png,image/webp}'
)
ON CONFLICT (id) DO NOTHING;
