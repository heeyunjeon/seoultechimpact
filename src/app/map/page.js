'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './map.module.css';

const dataConfig = {
  toilet: {
    latKey: 'WGS84위도',
    lngKey: 'WGS84경도',
    markerImage: '/icons/toilet.png',
  },
};

function Map() {
  const searchParams = useSearchParams();
  const object = searchParams.get('object');
  const [location, setLocation] = useState(null);
  const [items, setItems] = useState([]);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken =
      'pk.eyJ1IjoibmFlbmFoamVvbiIsImEiOiJjbTBzNmx0dnYwYmd3MmtwdDlpcHllcjFtIn0.U1p29oCiff8HM9Dx96NrkQ';
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [126.978, 37.5665],
      zoom: 10,
    });

    mapRef.current.on('load', () => {
      mapRef.current.loadImage(
        'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
        (error, image) => {
          if (error) throw error;
          mapRef.current.addImage('custom-marker', image);
        }
      );
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(newLocation);

          mapRef.current.flyTo({
            center: [newLocation.lng, newLocation.lat],
            zoom: 14,
          });

          new mapboxgl.Marker({ color: '#FF0000' })
            .setLngLat([newLocation.lng, newLocation.lat])
            .addTo(mapRef.current);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }

    if (object) {
      fetchData(object);
    }

    return () => mapRef.current.remove();
  });

  const fetchData = async (objectType) => {
    try {
      let jsonFileName;
      switch (objectType) {
        case 'toilet':
          jsonFileName = 'toilet.json';
          break;
        default:
          throw new Error('Unsupported object type');
      }
      const jsonUrl = new URL(`/data/${jsonFileName}`, window.location.origin);
      console.log('Fetching from URL:', jsonUrl.toString());

      const response = await fetch(jsonUrl.toString());

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const items = data.Sheet0 || [];
      console.log('Extracted items:', items);
      console.log('Number of items:', items.length);

      const filteredItems = items.filter(
        (item) =>
          item['소재지도로명주소']?.includes('서초구') &&
          item['소재지지번주소']?.includes('서초구')
      );
      console.log('Filtered:', filteredItems);

      setItems(filteredItems);

      if (mapRef.current) {
        addMarkersToMap(filteredItems, objectType);
      }
    } catch (error) {
      console.error(`Error fetching ${objectType} data:`, error);
    }
  };

  const addMarkersToMap = async (items, dataType) => {
    const config = dataConfig[dataType];
    if (!config) {
      console.error(`No configuration found for data type: ${dataType}`);
      return;
    }

    try {
      if (!mapRef.current.hasImage(`${dataType}-marker`)) {
        await new Promise((resolve, reject) => {
          mapRef.current.loadImage(config.markerImage, (error, image) => {
            if (error) reject(error);
            mapRef.current.addImage(`${dataType}-marker`, image);
            resolve();
          });
        });
      }
    } catch (error) {
      console.error(`Error loading marker image for ${dataType}:`, error);
      return;
    }

    const features = items
      .map((item) => {
        const lat = parseFloat(item[config.latKey]);
        const lng = parseFloat(item[config.lngKey]);

        console.log(lat, lng);

        if (isNaN(lat) || isNaN(lng)) {
          console.warn('Invalid coordinates for item:', item);
          return null;
        }

        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        };
      })
      .filter((feature) => feature !== null);

    if (features.length === 0) {
      console.warn('No valid features to add to the map');
      return;
    }

    if (mapRef.current.getSource('points')) {
      mapRef.current.removeLayer('points');
      mapRef.current.removeSource('points');
    }

    mapRef.current.addSource('points', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: features,
      },
    });

    mapRef.current.addLayer({
      id: 'points',
      type: 'symbol',
      source: 'points',
      layout: {
        'icon-image': `${dataType}-marker`,
        'icon-size': 0.1,
      },
    });
  };

  const getItemName = (item, dataType) => {
    switch (object) {
      case 'toilet':
        return item.화장실명;
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={styles.container}>
      <h1>Map Page</h1>
      <p>Showing closest {object}</p>
      {location && (
        <p>
          Your location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </p>
      )}
      <div id="map" className={styles.mapContainer} ref={mapContainerRef}></div>
      {/* {items.length > 0 && (
        <ul>
          {items.map((item, index) => (
            <li key={index}>{getItemName(item, object)}</li>
          ))}
        </ul>
      )} */}
    </div>
  );
}

export default Map;
