// Mock data for Indian states, districts, and famous places
export interface Place {
  id: string;
  name: string;
  category: 'Heritage & History' | 'Spiritual' | 'Nature' | 'Adventure' | 'Cultural' | 'Beach' | 'Wildlife';
  image: string;
  entryFee: string;
  description: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface District {
  id: string;
  name: string;
  places: Place[];
  coordinates: [number, number];
}

export interface State {
  id: string;
  name: string;
  districts: District[];
  centerCoordinates: [number, number];
  topPlaces: Place[];
}

export const INDIAN_STATES_DATA: State[] = [
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    centerCoordinates: [74.2179, 26.9124],
    districts: [
      {
        id: 'jaipur',
        name: 'Jaipur',
        coordinates: [75.7873, 26.9124],
        places: [
          {
            id: 'amber-fort',
            name: 'Amber Fort',
            category: 'Heritage & History',
            image: '/images/amber-fort.jpg',
            entryFee: '₹100',
            description: 'Majestic hilltop fort with stunning architecture',
            coordinates: [75.8513, 26.9855]
          },
          {
            id: 'hawa-mahal',
            name: 'Hawa Mahal',
            category: 'Heritage & History',
            image: '/images/hawa-mahal.jpg',
            entryFee: '₹50',
            description: 'Iconic pink palace with unique honeycomb design',
            coordinates: [75.8267, 26.9239]
          }
        ]
      }
    ],
    topPlaces: []
  },
  {
    id: 'kerala',
    name: 'Kerala',
    centerCoordinates: [76.2711, 10.8505],
    districts: [
      {
        id: 'alappuzha',
        name: 'Alappuzha',
        coordinates: [76.3388, 9.4981],
        places: [
          {
            id: 'backwaters',
            name: 'Alappuzha Backwaters',
            category: 'Nature',
            image: '/images/backwaters.jpg',
            entryFee: 'FREE ENTRY',
            description: 'Serene network of lagoons and lakes',
            coordinates: [76.3388, 9.4981]
          }
        ]
      }
    ],
    topPlaces: []
  }
];

export const getAllPlaces = (): Place[] => {
  const allPlaces: Place[] = [];
  INDIAN_STATES_DATA.forEach(state => {
    state.districts.forEach(district => {
      allPlaces.push(...district.places);
    });
  });
  return allPlaces;
};

export const getStateById = (stateId: string): State | undefined => {
  return INDIAN_STATES_DATA.find(state => state.id === stateId);
};
