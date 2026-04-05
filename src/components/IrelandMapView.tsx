"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo, useState } from "react";
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { GeoJsonObject } from "geojson";
import { LOCAL_AUTHORITIES } from "@/data/elected-layers";
import { LOCAL_AUTHORITY_CENTROIDS } from "@/data/local-authority-centroids";
import type { MapGeoNode } from "@/lib/graph-geo-positions";

const ESRI_IMAGERY =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const OSM = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const ESRI_ATTR =
  "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community";
const OSM_ATTR = "&copy; OpenStreetMap contributors";

type BaseLayer = "physical" | "street";

function InvalidateSizeOnMount() {
  const map = useMap();
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => map.invalidateSize());
    });
    return () => cancelAnimationFrame(id);
  }, [map]);
  return null;
}

function FitCombinedBounds({
  geo,
  markerPositions,
}: {
  geo: GeoJsonObject | null;
  markerPositions: [number, number][];
}) {
  const map = useMap();
  useEffect(() => {
    const parts: L.LatLngBounds[] = [];
    if (geo) {
      const layer = L.geoJSON(geo as Parameters<typeof L.geoJSON>[0]);
      const b = layer.getBounds();
      if (b.isValid()) parts.push(b);
    }
    if (markerPositions.length > 0) {
      const b = L.latLngBounds(markerPositions);
      if (b.isValid()) parts.push(b);
    }
    if (parts.length === 0) return;
    let acc = parts[0]!;
    for (let i = 1; i < parts.length; i++) acc = acc.extend(parts[i]!);
    map.fitBounds(acc, { padding: [32, 32], maxZoom: 9 });
  }, [map, geo, markerPositions]);
  return null;
}

type MapProps = {
  className?: string;
  /** When set, draws every graph node at an approximate geographic position (category colours). */
  graphNodes?: MapGeoNode[] | null;
  selectedNodeId?: string | null;
  onGraphNodeClick?: (id: string) => void;
};

export function IrelandMapView({
  className,
  graphNodes,
  selectedNodeId,
  onGraphNodeClick,
}: MapProps) {
  const [geo, setGeo] = useState<GeoJsonObject | null>(null);
  const [base, setBase] = useState<BaseLayer>("physical");
  const [hoverId, setHoverId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/geo/ireland-outline.geojson")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setGeo(data);
      })
      .catch(() => {
        if (!cancelled) setGeo(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const outlineStyle = useMemo(
    () => ({
      color: "#0d9488",
      weight: 2,
      fillColor: "#2dd4bf",
      fillOpacity: 0.12,
    }),
    [],
  );

  const laFallbackPoints = useMemo(() => {
    return LOCAL_AUTHORITIES.map((la) => {
      const c = LOCAL_AUTHORITY_CENTROIDS[la.id];
      return { la, pos: c ?? ([53.4129, -8.2439] as [number, number]) };
    });
  }, []);

  const useGraphLayer = graphNodes && graphNodes.length > 0;

  const fitPositions = useMemo((): [number, number][] => {
    if (useGraphLayer) return graphNodes!.map((n) => [n.lat, n.lng] as [number, number]);
    return laFallbackPoints.map((p) => p.pos);
  }, [useGraphLayer, graphNodes, laFallbackPoints]);

  const shell =
    className ??
    "relative h-[min(92dvh,880px)] w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-950";

  return (
    <div className={shell}>
      <div className="absolute left-3 top-3 z-[1000] flex flex-wrap gap-2">
        <div className="flex rounded-lg border border-white/15 bg-black/55 p-0.5 text-xs backdrop-blur-md">
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 font-medium ${
              base === "physical" ? "bg-teal-600 text-white" : "text-zinc-300 hover:bg-white/10"
            }`}
            onClick={() => setBase("physical")}
          >
            Physical (satellite)
          </button>
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 font-medium ${
              base === "street" ? "bg-teal-600 text-white" : "text-zinc-300 hover:bg-white/10"
            }`}
            onClick={() => setBase("street")}
          >
            Street map
          </button>
        </div>
      </div>

      <MapContainer
        center={[53.4129, -8.2439]}
        zoom={7}
        className="h-full w-full"
        scrollWheelZoom
        style={{ background: "#0a0a0a" }}
      >
        <InvalidateSizeOnMount />
        {base === "physical" ? (
          <TileLayer attribution={ESRI_ATTR} url={ESRI_IMAGERY} maxZoom={19} />
        ) : (
          <TileLayer attribution={OSM_ATTR} url={OSM} maxZoom={19} />
        )}
        <FitCombinedBounds geo={geo} markerPositions={fitPositions} />
        {geo && (
          <GeoJSON
            data={geo}
            style={() => outlineStyle}
            onEachFeature={(_f, layer) => {
              layer.bindPopup("Ireland (island outline · Natural Earth 110m)");
            }}
          />
        )}
        {useGraphLayer
          ? graphNodes!.map((n) => {
              const active = selectedNodeId === n.id || hoverId === n.id;
              return (
                <CircleMarker
                  key={n.id}
                  center={[n.lat, n.lng]}
                  radius={active ? 9 : 5}
                  pathOptions={{
                    color: "rgba(255,255,255,0.75)",
                    weight: active ? 2 : 1,
                    fillColor: n.fill,
                    fillOpacity: 0.9,
                  }}
                  eventHandlers={{
                    click: () => onGraphNodeClick?.(n.id),
                    mouseover: () => setHoverId(n.id),
                    mouseout: () => setHoverId(null),
                  }}
                >
                  <Popup>
                    <div className="min-w-[200px] text-sm text-zinc-900">
                      <p className="font-semibold">{n.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-zinc-600">
                        {n.category.replace(/_/g, " ")}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-zinc-500">{n.id}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })
          : laFallbackPoints.map(({ la, pos }) => {
              const active = hoverId === la.id;
              return (
                <CircleMarker
                  key={la.id}
                  center={pos}
                  radius={active ? 11 : 7}
                  pathOptions={{
                    color: "#0d9488",
                    weight: 2,
                    fillColor: active ? "#fbbf24" : "#2dd4bf",
                    fillOpacity: 0.85,
                  }}
                  eventHandlers={{
                    mouseover: () => setHoverId(la.id),
                    mouseout: () => setHoverId(null),
                  }}
                >
                  <Popup>
                    <div className="min-w-[200px] text-sm text-zinc-900">
                      <p className="font-semibold">{la.name}</p>
                      <p className="mt-1 text-xs text-zinc-600">
                        {la.head} · {la.seats} councillor seats
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
      </MapContainer>

      <p className="pointer-events-none absolute bottom-2 left-1/2 z-[1000] max-w-[min(96vw,560px)] -translate-x-1/2 text-center text-[10px] text-white/80 drop-shadow-md">
        {useGraphLayer
          ? "Each dot is a node from the government map (approximate geography). Click for details."
          : "Local authority markers overlaid on the island outline. Click a dot for details."}
      </p>
    </div>
  );
}
