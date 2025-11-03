
import React from 'react';
import Header from '../components/Header/Header';
import Funcionalidades from '../components/Funcionalidades/Funcionalidades';
import BannerSlides from '../components/BannerSlides/BannerSlides';
import Sobre from '../components/Sobre/Sobre';

<<<<<<< HEAD

=======
/*
  HomePage.tsx: Página inicial do projeto.
  Funciona como a vitrine, apresentando o produto DSIM, suas funcionalidades
  e o propósito da aplicação. Seu principal objetivo é informar o visitante e
  guiá-lo para a área principal do sistema através do botão 'Entrar'.
*/
>>>>>>> 6cb3298850116a63aa43f5d8d8b2feabfc52c032

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