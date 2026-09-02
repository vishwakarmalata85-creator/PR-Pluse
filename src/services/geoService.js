/**
 * NEXORA PULSE - 5 KM GEO-SPATIAL INVENTORY LOCATOR
 */

import { PHARMACIES, REFERENCE_LOCATION } from "../data/pharmacies.js";

export class GeoService {
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  }

  static queryNearbyPharmacies(prescriptionItems = [], maxRadiusKm = 5.0, userLocation = REFERENCE_LOCATION) {
    return PHARMACIES.map(pharmacy => {
      const distance = this.calculateDistance(userLocation.latitude, userLocation.longitude, pharmacy.latitude, pharmacy.longitude);
      
      const itemBreakdown = prescriptionItems.map(reqItem => {
        const reqName = (reqItem.name || reqItem.drug_name || "").toLowerCase();
        const match = pharmacy.inventory.find(inv => inv.drug_name.toLowerCase().includes(reqName));
        return {
          item_name: reqItem.name || reqItem.drug_name,
          is_available: !!(match && match.stock_quantity > 0),
          stock_quantity: match ? match.stock_quantity : 0,
          unit_price: match ? match.unit_price : 0
        };
      });

      const totalRequired = prescriptionItems.length;
      const totalInStock = itemBreakdown.filter(i => i.is_available).length;
      const stockStatus = totalRequired === 0 || totalInStock === totalRequired ? "FULL" : totalInStock > 0 ? "PARTIAL" : "OUT_OF_STOCK";

      return {
        ...pharmacy,
        calculated_distance_km: distance,
        in_radius: distance <= maxRadiusKm,
        stock_status: stockStatus,
        matched_items_count: totalInStock,
        total_items_count: totalRequired,
        item_breakdown: itemBreakdown
      };
    }).filter(p => p.in_radius).sort((a, b) => a.calculated_distance_km - b.calculated_distance_km);
  }
}
