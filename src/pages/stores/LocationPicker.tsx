import { useEffect, useRef, useState } from "react";
import { systemConfigService } from "../../services/systemConfigService";

export interface LocationPatch {
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: string;
  longitude?: string;
}

interface Props {
  latitude?: string;
  longitude?: string;
  onChange: (patch: LocationPatch) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

let mapsLoadPromise: Promise<void> | null = null;

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  if (mapsLoadPromise) return mapsLoadPromise;
  mapsLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
  return mapsLoadPromise;
}

const findComponent = (components: any[] | undefined, type: string) =>
  components?.find((c) => c.types.includes(type))?.long_name || "";

const patchFromGeocode = (result: any): LocationPatch => {
  const components = result.address_components;
  return {
    address: result.formatted_address || "",
    city: findComponent(components, "locality") || findComponent(components, "administrative_area_level_2"),
    state: findComponent(components, "administrative_area_level_1"),
    pincode: findComponent(components, "postal_code"),
  };
};

/**
 * Search-an-address + drag-a-pin picker, backed by the Google Maps JS SDK.
 * Writes address/city/state/pincode/lat/lng back to the parent form via
 * onChange — the parent's own Input fields stay the source of truth for
 * display and manual edits, this just fills them in.
 */
export function LocationPicker({ latitude, longitude, onChange }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await systemConfigService.getGoogleMapsKey();
        const apiKey = res?.data?.apiKey;
        if (!apiKey) {
          setError("Google Maps isn't configured yet — add a key under System Management > Google Maps.");
          return;
        }
        await loadGoogleMaps(apiKey);
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) setError("Could not load Google Maps.");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || !inputRef.current) return;
    const google = window.google;
    const geocoder = new google.maps.Geocoder();

    const initialLat = latitude ? Number(latitude) : 20.5937;
    const initialLng = longitude ? Number(longitude) : 78.9629;
    const hasInitial = !!latitude && !!longitude;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: initialLat, lng: initialLng },
      zoom: hasInitial ? 15 : 4,
    });

    const marker = new google.maps.Marker({
      map,
      position: { lat: initialLat, lng: initialLng },
      draggable: true,
    });

    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      const lat = pos.lat();
      const lng = pos.lng();
      onChangeRef.current({ latitude: String(lat), longitude: String(lng) });
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: string) => {
        if (status === "OK" && results?.[0]) onChangeRef.current(patchFromGeocode(results[0]));
      });
    });

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ["formatted_address", "geometry", "address_components"],
    });
    autocomplete.bindTo("bounds", map);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location) return;
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      map.setCenter({ lat, lng });
      map.setZoom(16);
      marker.setPosition({ lat, lng });
      onChangeRef.current({
        latitude: String(lat),
        longitude: String(lng),
        ...patchFromGeocode({ formatted_address: place.formatted_address, address_components: place.address_components }),
      });
    });
  }, [ready]);

  if (error) {
    return <p className="text-sm text-amber-600">{error}</p>;
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">Search location</label>
      <input
        ref={inputRef}
        placeholder="Search for the store address..."
        className="mb-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
      />
      <div ref={mapRef} style={{ width: "100%", height: 260, borderRadius: 8, background: "#f3f4f6" }} />
      <p className="mt-1 text-xs text-gray-500">
        {ready ? "Search an address above, or drag the pin to fine-tune the exact spot." : "Loading map…"}
      </p>
    </div>
  );
}
