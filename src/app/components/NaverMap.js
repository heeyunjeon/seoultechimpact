'use client';

import React, { useEffect } from 'react';

const NaverMap = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.X_NCP_APIGW_API_KEY_ID}`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      const map = new naver.maps.Map('map', {
        center: new naver.maps.LatLng(37.5665, 126.978),
        zoom: 10,
      });

      new naver.maps.Marker({
        position: new naver.maps.LatLng(37.5665, 126.978),
        map,
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return <div id="map" style={{ width: '100%', height: '400px' }} />;
};

export default NaverMap;
