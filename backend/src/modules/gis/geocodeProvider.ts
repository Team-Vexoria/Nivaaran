export interface GeocodeProvider { geocode(address: string): Promise<{lat:number, lng:number}>; }
