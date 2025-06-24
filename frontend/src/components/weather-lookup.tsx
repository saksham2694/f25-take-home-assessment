"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Copy } from "lucide-react";

export function WeatherLookup() {
  const [weatherId, setWeatherId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimeout = useRef<NodeJS.Timeout | null>(null);

  const isValidUUID = (id: string) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeatherId(e.target.value);
    setError(null); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8000/weather/${weatherId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to fetch weather data");
      }
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.id);
    setCopied(true);
    if (copyTimeout.current) clearTimeout(copyTimeout.current);
    copyTimeout.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Lookup Weather Data</CardTitle>
        <CardDescription>Enter your weather request ID to see the stored weather information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            placeholder="Enter weather request ID"
            value={weatherId}
            onChange={handleInputChange}
            required
            aria-label="Weather Request ID"
          />
          <Button type="submit" disabled={loading || !isValidUUID(weatherId)}>
            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2 inline" /> : null}
            {loading ? "Looking up..." : "Lookup"}
          </Button>
        </form>
        {error && (
          <div className="mt-4 p-3 rounded-md bg-red-900/20 text-red-500 border border-red-500">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        {result && (
          <div className="mt-4 p-3 rounded-md bg-green-900/20 text-green-500 border border-green-500">
            <div className="mb-2 flex items-center gap-2">
              <span className="font-semibold">ID:</span> <code>{result.id}</code>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded hover:bg-green-700/30 transition"
                title={copied ? "Copied!" : "Copy to clipboard"}
                aria-label="Copy ID to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
              {copied && <span className="text-xs text-green-300 ml-1">Copied!</span>}
            </div>
            <div><span className="font-semibold">Date:</span> {result.date}</div>
            <div><span className="font-semibold">Location:</span> {result.location}</div>
            {result.notes && <div><span className="font-semibold">Notes:</span> {result.notes}</div>}
            <div className="mt-4 flex items-center gap-4">
              {result.weather.weather_icons && result.weather.weather_icons[0] && (
                <img src={result.weather.weather_icons[0]} alt="Weather icon" className="w-16 h-16" />
              )}
              <div>
                <div className="text-2xl font-bold">
                  {result.weather.temperature}&deg;C
                </div>
                <div className="text-lg">
                  {result.weather.weather_descriptions && result.weather.weather_descriptions[0]}
                </div>
                <div className="text-sm text-muted-foreground">
                  Feels like: {result.weather.feelslike}&deg;C
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
              <div><span className="font-semibold">Observation Time:</span> {result.weather.observation_time}</div>
              <div><span className="font-semibold">Wind:</span> {result.weather.wind_speed} km/h {result.weather.wind_dir}</div>
              <div><span className="font-semibold">Humidity:</span> {result.weather.humidity}%</div>
              <div><span className="font-semibold">Pressure:</span> {result.weather.pressure} hPa</div>
              <div><span className="font-semibold">Cloud Cover:</span> {result.weather.cloudcover}%</div>
              <div><span className="font-semibold">UV Index:</span> {result.weather.uv_index}</div>
              <div><span className="font-semibold">Visibility:</span> {result.weather.visibility} km</div>
              <div><span className="font-semibold">Precipitation:</span> {result.weather.precip} mm</div>
            </div>
            {result.weather.astro && (
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-semibold">Sunrise:</span> {result.weather.astro.sunrise}</div>
                <div><span className="font-semibold">Sunset:</span> {result.weather.astro.sunset}</div>
                <div><span className="font-semibold">Moonrise:</span> {result.weather.astro.moonrise}</div>
                <div><span className="font-semibold">Moonset:</span> {result.weather.astro.moonset}</div>
                <div><span className="font-semibold">Moon Phase:</span> {result.weather.astro.moon_phase}</div>
                <div><span className="font-semibold">Moon Illumination:</span> {result.weather.astro.moon_illumination}%</div>
              </div>
            )}
            {result.weather.air_quality && (
              <div className="mt-4">
                <div className="font-semibold mb-1">Air Quality</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>CO: {result.weather.air_quality.co}</div>
                  <div>NO₂: {result.weather.air_quality.no2}</div>
                  <div>O₃: {result.weather.air_quality.o3}</div>
                  <div>SO₂: {result.weather.air_quality.so2}</div>
                  <div>PM2.5: {result.weather.air_quality.pm2_5}</div>
                  <div>PM10: {result.weather.air_quality.pm10}</div>
                  <div>US EPA Index: {result.weather.air_quality["us-epa-index"]}</div>
                  <div>GB DEFRA Index: {result.weather.air_quality["gb-defra-index"]}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 