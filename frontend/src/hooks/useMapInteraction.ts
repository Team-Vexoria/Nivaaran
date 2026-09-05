import { useState, useCallback } from 'react';

export interface MapState {
  zoom: number;
  center: [number, number];
  selectedState: string | null;
  hoveredState: string | null;
}

export const useMapInteraction = () => {
  const [mapState, setMapState] = useState<MapState>({
    zoom: 1,
    center: [78.9629, 22.5937], // Center of India
    selectedState: null,
    hoveredState: null
  });

  const zoomToState = useCallback((stateId: string, center: [number, number]) => {
    setMapState(prev => ({
      ...prev,
      selectedState: stateId,
      zoom: 2.5,
      center
    }));
  }, []);

  const resetZoom = useCallback(() => {
    setMapState({
      zoom: 1,
      center: [78.9629, 22.5937],
      selectedState: null,
      hoveredState: null
    });
  }, []);

  const setHoveredState = useCallback((stateId: string | null) => {
    setMapState(prev => ({
      ...prev,
      hoveredState: stateId
    }));
  }, []);

  return {
    mapState,
    zoomToState,
    resetZoom,
    setHoveredState
  };
};
