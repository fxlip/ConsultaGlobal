import React, { useEffect } from 'react';
import Search from '../components/Search';

export default function Home() {
    useEffect(() => {
        console.log('Home componente montado');
    }, []);

    return (
        <div className="home-container">
          <h1 className="home-title">
            Consulta Global
          </h1>
          <Search />
        </div>
      );
}