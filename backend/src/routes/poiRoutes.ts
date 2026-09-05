import { Router, Request, Response } from 'express';
import { resolvePOIImage, enrichPOIsWithImages, clearCache, POI } from '../services/poiImageService';

const router = Router();

// GET /api/explore/pois
router.get('/explore/pois', async (req: Request, res: Response) => {
  try {
    const city = (req.query.city as string) || '';

    // Standard POI dataset for Lokiva explore views
    const rawPOIs: POI[] = [
      { id: '1', name: 'Buland Darwaza', city: 'Fatehpur Sikri', location: 'Uttar Pradesh', category: 'Monument', description: 'The highest gateway in the world, built in 1601 by Mughal Emperor Akbar.' },
      { id: '2', name: 'Mehtab Bagh', city: 'Agra', location: 'Uttar Pradesh', category: 'Garden', description: 'Charbagh complex north of the Taj Mahal offering scenic sunset vistas.' },
      { id: '3', name: 'Hawa Mahal', city: 'Jaipur', location: 'Rajasthan', category: 'Palace', description: 'The Palace of Winds constructed of red and pink sandstone.' },
      { id: '4', name: 'Panch Mahal', city: 'Fatehpur Sikri', location: 'Uttar Pradesh', category: 'Architecture', description: 'Five-story columnar palace pavilion in Fatehpur Sikri.' },
      { id: '5', name: 'Sun Temple', city: 'Konark', location: 'Odisha', category: 'Temple', description: '13th-century CE Sun Temple shaped like a gigantic chariot.' },
    ];

    const filtered = city
      ? rawPOIs.filter((p) => p.city?.toLowerCase() === city.toLowerCase())
      : rawPOIs;

    const enrichedPOIs = await enrichPOIsWithImages(filtered, 5);

    return res.status(200).json({
      success: true,
      count: enrichedPOIs.length,
      data: enrichedPOIs,
    });
  } catch (error) {
    console.error('[POI API Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch explore POIs' });
  }
});

// GET /api/poi/image?name=Buland%20Darwaza&city=Fatehpur%20Sikri
router.get('/poi/image', async (req: Request, res: Response) => {
  try {
    const { name, city, location, category, refresh } = req.query;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Parameter "name" is required.' });
    }

    const poi: POI = {
      name: String(name),
      city: city ? String(city) : undefined,
      location: location ? String(location) : undefined,
      category: category ? String(category) : undefined,
    };

    const enriched = await resolvePOIImage(poi);
    return res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    console.error('[POI Image API Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to resolve POI image' });
  }
});

// POST /api/poi/clear-cache
router.post('/poi/clear-cache', (_req: Request, res: Response) => {
  clearCache();
  return res.status(200).json({ success: true, message: 'POI image cache cleared successfully.' });
});

export default router;
