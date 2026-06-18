export interface DeliveryPoint {
  latitude: number | null;
  longitude: number | null;
}

export interface DeliveryEstimate {
  straightDistanceKm: number;
  estimatedRoadDistanceKm: number;
  fee: number;
}

const toRad = (value: number) => (value * Math.PI) / 180;

export function haversineDistanceKm(from: DeliveryPoint, to: DeliveryPoint) {
  if (
    from.latitude === null ||
    from.longitude === null ||
    to.latitude === null ||
    to.longitude === null
  ) {
    return null;
  }

  const radiusKm = 6371;
  const dLat = toRad(to.latitude - from.latitude);
  const dLng = toRad(to.longitude - from.longitude);
  const lat1 = toRad(from.latitude);
  const lat2 = toRad(to.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return radiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function estimateDeliveryFee(
  from: DeliveryPoint,
  to: DeliveryPoint,
  options: {
    ratePerKm?: number;
    minFee?: number;
    curvatureMultiplier?: number;
  } = {},
): DeliveryEstimate | null {
  const straightDistanceKm = haversineDistanceKm(from, to);
  if (straightDistanceKm === null) {
    return null;
  }

  const ratePerKm = options.ratePerKm ?? 250;
  const minFee = options.minFee ?? 300;
  const curvatureMultiplier = options.curvatureMultiplier ?? 1.3;
  const estimatedRoadDistanceKm = straightDistanceKm * curvatureMultiplier;
  const fee = Math.max(minFee, Math.ceil((estimatedRoadDistanceKm * ratePerKm) / 50) * 50);

  return {
    straightDistanceKm: Number(straightDistanceKm.toFixed(2)),
    estimatedRoadDistanceKm: Number(estimatedRoadDistanceKm.toFixed(2)),
    fee,
  };
}
