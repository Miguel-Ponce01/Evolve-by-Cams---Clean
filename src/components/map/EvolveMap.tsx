"use client";

import { useState } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin, Navigation2, Clock } from "lucide-react";

/* ── Sunscor Bldg., R. Castillo & Arroyo St., Davao City ── */
const DAVAO_COORDINATES = {
  longitude: 125.64179,
  latitude: 7.10138,
  zoom: 15,
  pitch: 0,
  bearing: 0,
};

export default function EvolveMap() {
  const [viewState, setViewState] = useState(DAVAO_COORDINATES);
  const [activePopup, setActivePopup] = useState<"davao" | null>(null);

  return (
    <div className="relative w-full h-[420px] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl group">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        attributionControl={false}
      >
        <NavigationControl
          position="bottom-right"
          showCompass={true}
          showZoom={true}
          visualizePitch={false}
        />

        {/* ── Davao Marker ── */}
        <Marker
          longitude={DAVAO_COORDINATES.longitude}
          latitude={DAVAO_COORDINATES.latitude}
          anchor="bottom"
          onClick={(e: any) => {
            e.originalEvent.stopPropagation();
            setActivePopup("davao");
          }}
        >
          <div className="relative cursor-pointer transition-transform hover:scale-110">
            <div className="absolute -inset-5 bg-[#C9A961]/25 rounded-full animate-ping" />
            <div className="relative bg-gradient-to-br from-[#C9A961] to-[#8B6914] w-10 h-10 rounded-full flex items-center justify-center shadow-xl border-[3px] border-black">
              <MapPin className="w-5 h-5 text-black" />
            </div>
          </div>
        </Marker>

        {/* ── Davao Popup ── */}
        {activePopup === "davao" && (
          <Popup
            anchor="top"
            longitude={DAVAO_COORDINATES.longitude}
            latitude={DAVAO_COORDINATES.latitude}
            onClose={() => setActivePopup(null)}
            closeButton={false}
            className="evolve-popup"
            offset={20}
          >
            <div className="bg-black/85 backdrop-blur-xl p-4 rounded-2xl shadow-2xl min-w-[220px] border border-zinc-800">
              <h3 className="font-serif font-bold text-base text-white uppercase tracking-wide mb-0.5">
                Evolve Davao (HQ)
              </h3>
              <p className="text-[10px] text-zinc-400 leading-relaxed mb-1">
                3F Sunscor Bldg., corner Arroyo St.,<br />
                along R Castillo highway, Davao City, 8000
              </p>
              <p className="text-[10px] text-zinc-500 flex items-center gap-1 mb-3">
                <Clock className="w-3 h-3 text-[#C9A961]" />
                Mon–Sat &middot; 7 AM – 9 PM
              </p>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${DAVAO_COORDINATES.latitude},${DAVAO_COORDINATES.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-[#C9A961] text-black text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-[#b09352] transition-colors"
              >
                <Navigation2 className="w-3.5 h-3.5" />
                Get Directions
              </a>
            </div>
          </Popup>
        )}
      </Map>

      {/* Global MapLibre popup style overrides */}
      <style jsx global>{`
        .maplibregl-popup-content,
        .mapboxgl-popup-content {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .maplibregl-popup-tip,
        .mapboxgl-popup-tip {
          display: none !important;
        }
        .maplibregl-ctrl-group {
          background: rgba(0, 0, 0, 0.7) !important;
          backdrop-filter: blur(8px) !important;
          border-radius: 12px !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
          overflow: hidden !important;
        }
        .maplibregl-ctrl-group button {
          width: 34px !important;
          height: 34px !important;
        }
        .maplibregl-ctrl-group button + button {
          border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        .maplibregl-ctrl-group button span {
          filter: invert(1) !important;
        }
        .maplibregl-ctrl-compass .maplibregl-ctrl-icon {
          filter: invert(1) !important;
        }
      `}</style>
    </div>
  );
}
