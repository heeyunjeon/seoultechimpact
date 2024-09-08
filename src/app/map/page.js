'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './map.module.css';
import { useRouter } from 'next/navigation';
import { TiHome } from "react-icons/ti";
import { FaTrashAlt, FaRestroom } from "react-icons/fa";
import { PiCigaretteFill } from "react-icons/pi";

const dataConfig = {
  toilet: {
    latKey: 'WGS84위도',
    lngKey: 'WGS84경도',
    markerImage: '/icons/toilet.png',
  },
  trash: {
    latKey: '위도',
    lngKey: '경도',
    markerImage: '/icons/trash.png',
  },
  ciggy: {
    latKey: '위도',
    lngKey: '경도',
    markerImage: '/icons/ciggy.png',
  },
};

// Updated GeoJSON for line
const geojson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        coordinates: [
          [127.0553202308, 37.4475381547], // Starting point
          [127.065, 37.44], // Intermediate points if needed
          [127.075, 37.43], // Intermediate points if needed
          [127.085, 37.42], // Intermediate points if needed
          [127.095, 37.41], // Intermediate points if needed
          [127.1002, 37.4022], // Ending point
        ],
        type: 'LineString',
      },
    },
  ],
};

function MapComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const object = searchParams.get('object');
  const [location, setLocation] = useState(null);
  const [items, setItems] = useState([]);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip effect during SSR

    mapboxgl.accessToken =
      'pk.eyJ1IjoibmFlbmFoamVvbiIsImEiOiJjbTBzNmx0dnYwYmd3MmtwdDlpcHllcjFtIn0.U1p29oCiff8HM9Dx96NrkQ';

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [127.1002, 37.4022], // Center on the start point of the line
      zoom: 14,
    });

    mapRef.current.on('load', () => {
      mapRef.current.loadImage(
        'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
        (error, image) => {
          if (error) throw error;
          mapRef.current.addImage('custom-marker', image);
        }
      );

      // Add the line from geojson and its gradient paint
      mapRef.current.addSource('line', {
        type: 'geojson',
        lineMetrics: true,
        data: geojson,
      });

      mapRef.current.addLayer({
        type: 'line',
        source: 'line',
        id: 'line',
        paint: {
          'line-color': 'red',
          'line-width': 14,
          'line-gradient': [
            'interpolate',
            ['linear'],
            ['line-progress'],
            0,
            'blue',
            0.1,
            'royalblue',
            0.3,
            'cyan',
            0.5,
            'lime',
            0.7,
            'yellow',
            1,
            'red',
          ],
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });
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
  }, [object]);

  const fetchData = async (objectType) => {
    try {
      let response;

      switch (objectType) {
        case 'toilet':
          response = await fetch(`/data/toilet.json`);
          break;
        case 'trash':
          response = await fetch(`/data/trash.json`);
          break;
        case 'ciggy':
          response = await fetch(
            'https://api.odcloud.kr/api/15104099/v1/uddi:c90729c3-981d-49b3-85d4-ee022a9a2bfb',
            {
              headers: {
                Authorization: 'Infuser data-portal-test-key',
              },
            }
          );
          break;
        default:
          throw new Error('Unsupported object type');
      }

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('data:', data);
      let items = [];

      if (objectType === 'toilet') {
        items = data.Sheet0 || [];
      } else if (objectType === 'trash') {
        items = data.records || [];
      } else if (objectType === 'ciggy') {
        items = [];
        let i = 0;
        while (i < 10 && i < data.data.length) {
          items.push(data.data[i]);
          i += 1;
        }
      }

      setItems(items);

      if (mapRef.current) {
        addMarkersToMap(items, objectType);
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
    switch (dataType) {
      case 'toilet':
        return item.화장실명;
      default:
        return 'Unknown';
    }
  };

  const handleButtonClick = (object) => {
    if (object === 'home') {
      router.push('/');
    } else {
      router.push(`/map/detail`);
    }
  };

  const title = () => {
    if (object === 'trash') {
      return 'Bin';
    } else if (object === 'ciggy') {
      return 'Smoking Place';
    } else if (object === 'toilet') {
      return 'Toilet';
    }
  }

  return (
    <div className={styles.container}>
      <TiHome onClick={() => handleButtonClick('home')} size={30} />
      <h2 className={styles.title}>{title()} Near Me</h2>
      <p>Showing closest {title()} </p>
      {location && <p>Your location: Seoul Tech Impact 2024 @ Goorm</p>}
      <div id="map" className={styles.mapContainer} ref={mapContainerRef}></div>
      {/* {items.length > 0 && (
        <ul>
          {items.map((item, index) => (
            <li key={index}>{getItemName(item, object)}</li>
          ))}
        </ul>
      )} */}
      <div className={styles.buttonWrapper}>
        <button className={styles.firstButton} onClick={() => handleButtonClick({ object })}>Nearest</button>
        <button className={styles.secondButton}>Find the way</button></div>

    </div>
  );
}

// Wrap the map component in a Suspense boundary to handle client-side only hooks
export default function MapPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MapComponent />
    </Suspense>
  );
}
