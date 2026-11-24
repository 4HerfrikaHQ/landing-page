INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-videos',
  'course-videos',
  false,
  209715200,
  '{video/mp4,text/vtt}'
)
ON CONFLICT (id) DO NOTHING;
