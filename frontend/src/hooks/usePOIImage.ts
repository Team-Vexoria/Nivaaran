import { useState, useEffect } from 'react';

export function usePOIImage(name: string, city?: string) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function fetchImage() {
      try {
        const params = new URLSearchParams({ name, ...(city ? { city } : {}) });
        const res = await fetch(`/api/poi/image?${params.toString()}`);
        const data = await res.json();

        if (isMounted && data.success && data.data?.imageUrl) {
          setImageUrl(data.data.imageUrl);
        }
      } catch (err) {
        console.warn('Failed to fetch POI image dynamically:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (name) {
      fetchImage();
    }

    return () => {
      isMounted = false;
    };
  }, [name, city]);

  return { imageUrl, loading };
}
