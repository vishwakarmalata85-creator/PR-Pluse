/**
 * NEXORA PULSECARE - REAL-TIME GEO-SPATIAL MAP SERVICE (POWERED BY LEAFLET)
 * Handles interactive mapping, live GPS telemetry, dynamic radius rings, and pharmacy markers.
 */

import { REFERENCE_LOCATION } from "../data/pharmacies.js";
import { GeoService } from "./geoService.js";
import { store } from "../state/store.js";

export class RealtimeMapService {
  constructor() {
    this.map = null;
    this.userLocation = { ...REFERENCE_LOCATION };
    this.userMarker = null;
    this.radiusCircle = null;
    this.pharmacyMarkers = new Map();
    this.currentTileLayer = null;
    this.mapStyle = "light"; // 'light' | 'dark' | 'streets'
    this.isTrackingLive = false;
  }

  /**
   * Initializes the Leaflet map on the specified DOM element
   */
  initMap(elementId = "pharmacy-realtime-map", onMarkerClick = null) {
    if (typeof window === "undefined" || !window.L) {
      console.warn("Leaflet library not loaded yet.");
      return null;
    }

    const container = document.getElementById(elementId);
    if (!container) return null;

    // If map already initialized, remove previous instance cleanly
    if (this.map) {
      try {
        this.map.remove();
      } catch (e) {
        console.warn("Map cleanup notice:", e);
      }
      this.map = null;
    }

    // Create Leaflet map centered at user location
    this.map = window.L.map(elementId, {
      center: [this.userLocation.latitude, this.userLocation.longitude],
      zoom: 14.5,
      zoomControl: false,
      attributionControl: false
    });

    // Add Zoom Control at bottom right
    window.L.control.zoom({ position: "bottomright" }).addTo(this.map);

    // Add beautiful CartoDB Positron / Voyager high-res vector tiles
    this.setMapStyle("light");

    // Add User GPS Location Marker
    this.renderUserMarker();

    // Add Initial Radius Ring
    const state = store.getState();
    this.updateRadiusCircle(state.searchRadiusKm || 5.0);

    // Initial render of pharmacy markers
    this.syncPharmacyMarkers(onMarkerClick);

    // Invalidate size to ensure crisp rendering after DOM paint
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 250);

    return this.map;
  }

  /**
   * Sets Tile Layer Style
   */
  setMapStyle(style = "light") {
    if (!this.map || !window.L) return;
    this.mapStyle = style;

    if (this.currentTileLayer) {
      this.map.removeLayer(this.currentTileLayer);
    }

    let tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    if (style === "dark") {
      tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    } else if (style === "streets") {
      tileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    }

    this.currentTileLayer = window.L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: "abcd"
    }).addTo(this.map);
  }

  /**
   * Renders the patient's current location pin with pulsing GPS radar ring
   */
  renderUserMarker() {
    if (!this.map || !window.L) return;

    if (this.userMarker) {
      this.map.removeLayer(this.userMarker);
    }

    const userIcon = window.L.divIcon({
      className: "user-gps-marker-container",
      html: `
        <div class="user-gps-marker">
          <div class="user-gps-pulse"></div>
          <div class="user-gps-dot"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    this.userMarker = window.L.marker(
      [this.userLocation.latitude, this.userLocation.longitude],
      { icon: userIcon, zIndexOffset: 2000 }
    ).addTo(this.map);

    this.userMarker.bindPopup(`
      <div style="padding: 12px 14px; text-align: center; min-width: 170px;">
        <div style="font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px;">📍 Your Location</div>
        <div style="font-weight: 700; font-size: 13px; color: #111827; margin-top: 2px;">${this.userLocation.area_name || 'Koramangala, Bengaluru'}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Lat: ${this.userLocation.latitude.toFixed(4)}, Lon: ${this.userLocation.longitude.toFixed(4)}</div>
      </div>
    `);
  }

  /**
   * Updates or creates the geo-spatial radius circle
   */
  updateRadiusCircle(radiusKm = 5.0) {
    if (!this.map || !window.L) return;

    const radiusMeters = radiusKm * 1000;

    if (!this.radiusCircle) {
      this.radiusCircle = window.L.circle(
        [this.userLocation.latitude, this.userLocation.longitude],
        {
          radius: radiusMeters,
          color: "#0284c7",
          weight: 2,
          opacity: 0.8,
          fillColor: "#0284c7",
          fillOpacity: 0.08,
          dashArray: "6, 6"
        }
      ).addTo(this.map);
    } else {
      this.radiusCircle.setLatLng([this.userLocation.latitude, this.userLocation.longitude]);
      this.radiusCircle.setRadius(radiusMeters);
    }
  }

  /**
   * Syncs and plots all nearby pharmacies with match badges and popups
   */
  syncPharmacyMarkers(onMarkerClick = null) {
    if (!this.map || !window.L) return;

    const state = store.getState();
    const radius = state.searchRadiusKm || 5.0;
    const prescribedItems = state.prescribedItems || [];
    const pharmacies = GeoService.queryNearbyPharmacies(prescribedItems, radius, this.userLocation);

    // Clear previous markers
    this.pharmacyMarkers.forEach(marker => this.map.removeLayer(marker));
    this.pharmacyMarkers.clear();

    pharmacies.forEach(pharma => {
      const isFull = pharma.stock_status === "FULL";
      const iconHtml = `
        <div class="pharmacy-map-pin ${isFull ? 'full-stock-pin' : 'partial-stock-pin'}" data-pharma-id="${pharma.id}">
          <div class="pin-badge-dot"></div>
          <span>${pharma.name.split(" ")[0]}</span>
          <span style="font-size: 10px; color: ${isFull ? '#00b473' : '#d97706'}; font-weight: 800;">(${pharma.calculated_distance_km}km)</span>
        </div>
      `;

      const customIcon = window.L.divIcon({
        className: "pharmacy-marker-wrapper",
        html: iconHtml,
        iconSize: [120, 30],
        iconAnchor: [60, 15]
      });

      const marker = window.L.marker([pharma.latitude, pharma.longitude], { icon: customIcon })
        .addTo(this.map);

      // Rich interactive popup
      const popupHtml = `
        <div style="padding: 14px 16px; width: 260px; font-family: 'Plus Jakarta Sans', sans-serif;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
            <div>
              <div style="font-weight: 800; font-size: 14px; color: #111827; line-height: 1.2;">${pharma.name}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">📍 ${pharma.address}</div>
            </div>
          </div>

          <div style="display: flex; gap: 6px; margin: 8px 0; align-items: center;">
            <span style="padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; background: ${isFull ? '#dcfce7' : '#fef3c7'}; color: ${isFull ? '#15803d' : '#b45309'}; border: 1px solid ${isFull ? '#86efac' : '#fde68a'};">
              ${isFull ? '✓ 100% FULL MATCH' : '⚠ PARTIAL STOCK'}
            </span>
            <span style="font-size: 11px; font-weight: 600; color: #0284c7;">${pharma.calculated_distance_km} km away</span>
          </div>

          <div style="font-size: 11px; color: #374151; background: #f8fafc; padding: 6px 10px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 10px;">
            🕒 <strong>${pharma.open_status || 'Open Now'}</strong> • ⭐ <strong>${pharma.rating}</strong>
            <div style="color: #059669; font-weight: 600; margin-top: 2px;">💡 Generic substitution saves ₹169</div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <button class="button-primary btn-map-pickup" data-pharma-id="${pharma.id}" data-pharma-name="${pharma.name}" style="padding: 6px 8px; font-size: 11px; justify-content: center;">
              <span>Store Pickup</span>
            </button>
            <button class="button-secondary btn-map-delivery" data-pharma-id="${pharma.id}" data-pharma-name="${pharma.name}" style="padding: 6px 8px; font-size: 11px; justify-content: center; background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8;">
              <span>🚀 Delivery</span>
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      if (onMarkerClick) {
        marker.on("click", () => onMarkerClick(pharma));
      }

      this.pharmacyMarkers.set(pharma.id, marker);
    });
  }

  /**
   * Smoothly flies and focuses on a specific pharmacy
   */
  flyToPharmacy(pharmacyId) {
    if (!this.map || !this.pharmacyMarkers.has(pharmacyId)) return;
    const marker = this.pharmacyMarkers.get(pharmacyId);
    const latLng = marker.getLatLng();

    this.map.flyTo([latLng.lat, latLng.lng], 16, {
      duration: 1.0,
      easeLinearity: 0.25
    });

    setTimeout(() => {
      marker.openPopup();
    }, 1000);
  }

  /**
   * Centers the map back to user coordinates
   */
  recenterOnUser() {
    if (!this.map) return;
    this.map.flyTo([this.userLocation.latitude, this.userLocation.longitude], 14.5, {
      duration: 0.8
    });
  }

  /**
   * Triggers Browser HTML5 Geolocation to obtain real-time GPS coordinates
   */
  requestLiveLocation(onSuccess = null, onError = null) {
    if (!navigator.geolocation) {
      if (onError) onError(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          area_name: "Your Live GPS Coordinates"
        };
        this.isTrackingLive = true;

        if (this.map) {
          this.renderUserMarker();
          const state = store.getState();
          this.updateRadiusCircle(state.searchRadiusKm || 5.0);
          this.syncPharmacyMarkers();
          this.recenterOnUser();
        }

        if (onSuccess) onSuccess(this.userLocation);
      },
      (err) => {
        console.warn("Geolocation permission denied or timed out:", err.message);
        if (onError) onError(err);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }
}

export const realtimeMapService = new RealtimeMapService();
