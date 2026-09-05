import { RealCoordinates } from './indiaGeoData';

// Landmark coordinates with real GPS
export const LANDMARK_GPS_COORDINATES: Record<string, RealCoordinates> = {
  // Heritage & History
  'taj-mahal': { lat: 27.1751, lng: 78.0421 },
  'gateway-india': { lat: 18.9220, lng: 72.8347 },
  'hampi-ruins': { lat: 15.3350, lng: 76.4600 },
  'ajanta-caves': { lat: 20.5520, lng: 75.7033 },
  'red-fort': { lat: 28.6562, lng: 77.2410 },
  
  // Spiritual & Sacred
  'varanasi-ghats': { lat: 25.3176, lng: 83.0110 },
  'meenakshi-temple': { lat: 9.9195, lng: 78.1193 },
  'golden-temple': { lat: 31.6200, lng: 74.8765 },
  'tirupati-balaji': { lat: 13.6833, lng: 79.3472 },
  
  // Nature & Wildlife
  'munnar-tea': { lat: 10.0889, lng: 77.0595 },
  'valley-flowers': { lat: 30.7310, lng: 79.6041 },
  'ranthambore': { lat: 26.0173, lng: 76.5026 },
  
  // Hill Stations
  'shimla': { lat: 31.1048, lng: 77.1734 },
  'manali': { lat: 32.2396, lng: 77.1887 },
  'ooty': { lat: 11.4064, lng: 76.6932 },
  'darjeeling': { lat: 27.0410, lng: 88.2663 },
  
  // Cities
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'udaipur': { lat: 24.5854, lng: 73.7125 },
  'agra': { lat: 27.1767, lng: 78.0081 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'kochi': { lat: 9.9312, lng: 76.2673 },
  'goa': { lat: 15.2993, lng: 74.1240 },
  'pondicherry': { lat: 11.9416, lng: 79.8083 },
};

// District data for major states
export interface DistrictInfo {
  name: string;
  state: string;
  coordinates: RealCoordinates;
}

export const MAJOR_DISTRICTS: DistrictInfo[] = [
  // Rajasthan
  { name: 'Jaipur', state: 'Rajasthan', coordinates: { lat: 26.9124, lng: 75.7873 } },
  { name: 'Udaipur', state: 'Rajasthan', coordinates: { lat: 24.5854, lng: 73.7125 } },
  { name: 'Jodhpur', state: 'Rajasthan', coordinates: { lat: 26.2389, lng: 73.0243 } },
  { name: 'Jaisalmer', state: 'Rajasthan', coordinates: { lat: 26.9157, lng: 70.9083 } },
  
  // Uttar Pradesh
  { name: 'Agra', state: 'Uttar Pradesh', coordinates: { lat: 27.1767, lng: 78.0081 } },
  { name: 'Varanasi', state: 'Uttar Pradesh', coordinates: { lat: 25.3176, lng: 82.9739 } },
  { name: 'Lucknow', state: 'Uttar Pradesh', coordinates: { lat: 26.8467, lng: 80.9462 } },
  
  // Maharashtra
  { name: 'Mumbai', state: 'Maharashtra', coordinates: { lat: 19.0760, lng: 72.8777 } },
  { name: 'Pune', state: 'Maharashtra', coordinates: { lat: 18.5204, lng: 73.8567 } },
  { name: 'Aurangabad', state: 'Maharashtra', coordinates: { lat: 19.8762, lng: 75.3433 } },
  
  // Karnataka
  { name: 'Bengaluru', state: 'Karnataka', coordinates: { lat: 12.9716, lng: 77.5946 } },
  { name: 'Mysuru', state: 'Karnataka', coordinates: { lat: 12.2958, lng: 76.6394 } },
  { name: 'Hampi', state: 'Karnataka', coordinates: { lat: 15.3350, lng: 76.4600 } },
  
  // Tamil Nadu
  { name: 'Chennai', state: 'Tamil Nadu', coordinates: { lat: 13.0827, lng: 80.2707 } },
  { name: 'Madurai', state: 'Tamil Nadu', coordinates: { lat: 9.9252, lng: 78.1198 } },
  { name: 'Coimbatore', state: 'Tamil Nadu', coordinates: { lat: 11.0168, lng: 76.9558 } },
  
  // Kerala
  { name: 'Kochi', state: 'Kerala', coordinates: { lat: 9.9312, lng: 76.2673 } },
  { name: 'Thiruvananthapuram', state: 'Kerala', coordinates: { lat: 8.5241, lng: 76.9366 } },
  { name: 'Munnar', state: 'Kerala', coordinates: { lat: 10.0889, lng: 77.0595 } },
  
  // West Bengal
  { name: 'Kolkata', state: 'West Bengal', coordinates: { lat: 22.5726, lng: 88.3639 } },
  { name: 'Darjeeling', state: 'West Bengal', coordinates: { lat: 27.0410, lng: 88.2663 } },
  
  // Punjab
  { name: 'Amritsar', state: 'Punjab', coordinates: { lat: 31.6340, lng: 74.8723 } },
  { name: 'Chandigarh', state: 'Punjab', coordinates: { lat: 30.7333, lng: 76.7794 } },
  
  // Himachal Pradesh
  { name: 'Shimla', state: 'Himachal Pradesh', coordinates: { lat: 31.1048, lng: 77.1734 } },
  { name: 'Manali', state: 'Himachal Pradesh', coordinates: { lat: 32.2396, lng: 77.1887 } },
];
