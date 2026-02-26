"use client";

import { useCallback, useState, useEffect } from "react";
import { Autocomplete, Button, TextField } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { useTranslation } from "./TranslationProvider";
import { track } from "../../../utils/mixpanel";
import type { GeoLocation } from "../../../lib/calculator";

type NominatimSearchItem = {
  display_name: string;
  lat: string;
  lon: string;
  address?: { city?: string; town?: string; village?: string; state?: string; country?: string };
};

const LOCATION_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

function setLocationCookie(loc: GeoLocation) {
  const value = encodeURIComponent(JSON.stringify(loc));
  document.cookie = `location=${value};path=/;max-age=${LOCATION_COOKIE_MAX_AGE};SameSite=Lax`;
}

async function searchPlaces(q: string): Promise<NominatimSearchItem[]> {
  const params = new URLSearchParams({ action: "search", q });
  const res = await fetch(`/api/v2/geocode?${params}`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function reverseGeocode(lat: number, lon: number): Promise<{ display_name: string; city?: string; timezone?: string } | null> {
  const params = new URLSearchParams({
    action: "reverse",
    lat: String(lat),
    lon: String(lon),
  });
  const res = await fetch(`/api/v2/geocode?${params}`);
  if (!res.ok) return null;
  const data = await res.json();
  const display_name = data.display_name ?? `${lat}, ${lon}`;
  const address = data.address ?? {};
  const city = address.city ?? address.town ?? address.village ?? address.state ?? undefined;
  return { display_name, city, timezone: undefined };
}

type LocationSelectorProps = {
  value: GeoLocation | null;
  onChange: (location: GeoLocation) => void;
};

export function LocationSelector({ value, onChange }: LocationSelectorProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(value?.city ?? (value ? `${value.lat.toFixed(2)}, ${value.lng.toFixed(2)}` : ""));
  const [options, setOptions] = useState<NominatimSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchOptions = useCallback(async (q: string) => {
    if (!q.trim()) {
      setOptions([]);
      return;
    }
    setLoading(true);
    track("Location Search", { query: q });
    try {
      const items = await searchPlaces(q);
      setOptions(items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setInputValue(value?.city ?? (value ? `${value.lat.toFixed(2)}, ${value.lng.toFixed(2)}` : ""));
  }, [value?.lat, value?.lng, value?.city]);

  useEffect(() => {
    const q = inputValue.trim();
    if (!q) return;
    const id = setTimeout(() => fetchOptions(q), 300);
    return () => clearTimeout(id);
  }, [inputValue, fetchOptions]);

  const handleFocus = () => {
    setOpen(true);
    track("Location Focus");
  };

  const handleSelect = (_: unknown, option: NominatimSearchItem | string | null) => {
    if (!option || typeof option === "string") return;
    const lat = parseFloat(option.lat);
    const lon = parseFloat(option.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    const city = option.address?.city ?? option.address?.town ?? option.address?.village ?? option.display_name;
    const location: GeoLocation = {
      lng: lon,
      lat,
      city: city ?? option.display_name,
      timezone: "UTC",
    };
    setLocationCookie(location);
    onChange(location);
    setInputValue(option.display_name);
    setOptions([]);
    track("Location Select", { display_name: option.display_name });
  };

  const handleMyLocation = () => {
    track("Location Geolocation Request");
    if (!navigator.geolocation) {
      track("Location Geolocation Unsupported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        track("Location Geolocation Success", { lat, lon });
        const rev = await reverseGeocode(lat, lon);
        const location: GeoLocation = {
          lng: lon,
          lat,
          city: rev?.city ?? rev?.display_name,
          timezone: rev?.timezone ?? "UTC",
        };
        setLocationCookie(location);
        onChange(location);
        setInputValue(rev?.display_name ?? `${lat.toFixed(2)}, ${lon.toFixed(2)}`);
      },
      () => {
        track("Location Geolocation Denied");
      },
    );
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <Autocomplete
        freeSolo
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        inputValue={inputValue}
        onInputChange={(_, v) => setInputValue(v)}
        options={options}
        getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.display_name)}
        loading={loading}
        onFocus={handleFocus}
        onChange={handleSelect}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t("location.placeholder")}
            size="small"
            sx={{ minWidth: 280 }}
          />
        )}
      />
      <Button
        variant="outlined"
        startIcon={<MyLocationIcon />}
        onClick={handleMyLocation}
        size="medium"
      >
        {t("location.myLocation")}
      </Button>
    </div>
  );
}
