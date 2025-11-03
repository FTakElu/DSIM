
import React from 'react';
import Header from '../components/Header/Header';
import Funcionalidades from '../components/Funcionalidades/Funcionalidades';
import BannerSlides from '../components/BannerSlides/BannerSlides';
import Sobre from '../components/Sobre/Sobre';


const HomePage: React.FC = () => {
  return (
    <>
      <Header />
      <main>
        <BannerSlides />
        <Sobre />
        <Funcionalidades />

      </main>
    </>
  );
};

export default HomePage;