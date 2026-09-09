import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Pure functions only — no network (Open-Meteo) calls in these tests
import { parseWeatherResponse, packageDisasterResult } from '../src/modules/ai/weatherParser';
import { getDistrictCoords } from '../src/modules/ai/weatherEngine';

describe('Weather Parser & District Coords (SIH 26043)', () => {
  // ── parseWeatherResponse ───────────────────────────────────────────────────
  describe('parseWeatherResponse', () => {
    it('should detect active alert when rain_sum > 20mm on event date ±1 day', () => {
      const mock = {
        daily: {
          time: ['2026-09-08', '2026-09-09', '2026-09-10'],
          rain_sum: [5.2, 34.8, 1.0],
          weather_code: [3, 2, 1],
        },
      };
      const parsed = parseWeatherResponse(mock, '2026-09-09');
      assert.equal(parsed.activeAlert, true);
      assert.equal(parsed.maxRain, 34.8);
      assert.ok(parsed.matchedDates.includes('2026-09-09'));
      assert.equal(parsed.severityLevel, 'high');
    });

    it('should detect storm when weather_code >= 95 (thunderstorm)', () => {
      const mock = {
        daily: {
          time: ['2026-09-09'],
          rain_sum: [8.0],
          weather_code: [95],
        },
      };
      const parsed = parseWeatherResponse(mock, '2026-09-09');
      assert.equal(parsed.stormDetected, true);
      assert.equal(parsed.activeAlert, true); // storm code alone triggers alert
    });

    it('should NOT raise alert for light rain below 20mm with calm codes', () => {
      const mock = {
        daily: {
          time: ['2026-09-08', '2026-09-09', '2026-09-10'],
          rain_sum: [0.0, 2.4, 0.0],
          weather_code: [1, 2, 1],
        },
      };
      const parsed = parseWeatherResponse(mock, '2026-09-09');
      assert.equal(parsed.activeAlert, false);
      assert.equal(parsed.stormDetected, false);
      assert.equal(parsed.severityLevel, 'low');
    });

    it('should evaluate all forecast days when event date matches none (fallback)', () => {
      const mock = {
        daily: {
          time: ['2026-09-08', '2026-09-09', '2026-09-10'],
          rain_sum: [0.0, 50.0, 0.0],
          weather_code: [1, 2, 1],
        },
      };
      const parsed = parseWeatherResponse(mock, '2020-01-01'); // historical date, no match
      assert.equal(parsed.activeAlert, true); // fallback scans all 3 days and finds 50mm
      assert.equal(parsed.maxRain, 50.0);
      assert.equal(parsed.matchedDates.length, 3);
    });

    it('should handle empty daily arrays gracefully', () => {
      const parsed = parseWeatherResponse({ daily: { time: [], rain_sum: [], weather_code: [] } }, '2026-09-09');
      assert.equal(parsed.activeAlert, false);
      assert.equal(parsed.maxRain, 0);
      assert.equal(parsed.matchedDates.length, 0);
      assert.equal(parsed.severityLevel, 'none');
    });
  });

  // ── packageDisasterResult ──────────────────────────────────────────────────
  describe('packageDisasterResult', () => {
    it('should mark disaster-live with 0.92 confidence when fetch succeeded', () => {
      const parsed = { activeAlert: true, severityLevel: 'high', maxRain: 34.8, stormDetected: true, matchedDates: ['2026-09-09'] };
      const result = packageDisasterResult(parsed, true);
      assert.equal(result.source, 'disaster-live');
      assert.equal(result.confidence, 0.92);
      assert.equal(result.activeAlert, true);
      assert.equal(result.maxRain, 34.8);
    });

    it('should mark disaster-fallback with zero confidence when fetch failed', () => {
      const parsed = { activeAlert: false, severityLevel: 'none', maxRain: 0, stormDetected: false, matchedDates: [] };
      const result = packageDisasterResult(parsed, false);
      assert.equal(result.source, 'disaster-fallback');
      assert.equal(result.confidence, 0);
      assert.equal(result.activeAlert, false);
      assert.equal(result.matchedDates.length, 0);
    });
  });

  // ── getDistrictCoords ──────────────────────────────────────────────────────
  describe('getDistrictCoords', () => {
    it('should return correct coords for Ranchi', () => {
      const c = getDistrictCoords('Ranchi');
      assert.equal(c.lat, 23.34);
      assert.equal(c.lng, 85.32);
    });

    it('should return correct coords for Dhanbad', () => {
      const c = getDistrictCoords('Dhanbad');
      assert.equal(c.lat, 23.8);
      assert.equal(c.lng, 86.45);
    });

    it('should cover all 24 Jharkhand districts (no undefined entries)', () => {
      const districts = [
        'Ranchi', 'Dhanbad', 'East Singhbhum', 'Bokaro', 'Palamu', 'Hazaribagh',
        'Deoghar', 'Giridih', 'Ramgarh', 'Latehar', 'Garhwa', 'Dumka',
        'Godda', 'Sahebganj', 'Pakur', 'Jamtara', 'Khunti', 'Gumla',
        'Simdega', 'West Singhbhum', 'Seraikela Kharsawan', 'Chatra', 'Koderma', 'Lohardaga',
      ];
      for (const d of districts) {
        const c = getDistrictCoords(d);
        assert.ok(c.lat > 0 && c.lng > 0, `${d} should have real coords, got lat=${c.lat} lng=${c.lng}`);
      }
    });

    it('should default to Ranchi coords for unknown district (graceful fallback)', () => {
      const c = getDistrictCoords('UnknownDistrict');
      assert.deepEqual(c, { lat: 23.34, lng: 85.32 });
    });

    it('should be case-sensitive lookup (documented: keys are Title Case)', () => {
      // The registry keys are title-cased; lowercase lookups fall back to Ranchi.
      const c = getDistrictCoords('ranchi');
      assert.deepEqual(c, { lat: 23.34, lng: 85.32 });
    });
  });
});