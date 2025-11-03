import React from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

/*
  Utilizei a biblioteca Swiper.js para criar o carrossel de banners.
  O Swiper é como um "motor" para slides, permitindo importar apenas as funcionalidades
  necessárias (como Autoplay e EffectFade), mantendo a aplicação fluída.
*/

import styles from './BannerSlides.module.css';

import relogioImg from '../../assets/relogio-img.jpg';
import pacienteImg from '../../assets/paciente-img.jpg';
import tecnologiaImg from '../../assets/tecnologia-img.jpg';

const BannerSlides: React.FC = () => {
  const slideImages = [relogioImg, pacienteImg, tecnologiaImg];

  return (
    <section className={styles.BannerSlides}>
      
      <Swiper
        modules={[Autoplay, EffectFade]}
        
        effect={'fade'}
        loop={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        className={styles.swiperContainer}
      >
        {slideImages.map((image, index) => (
          <SwiperSlide key={index} className={styles.swiperSlide}>
            <img src={image} alt={`Slide ${index + 1}`} />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className={styles.heroOverlay}></div>
      <div className={styles.heroContent}>
        <h1 className={styles.title}>Segurança que cuida, tecnologia que protege.</h1>
        <p className={styles.subtitle}>
          Monitoramento em tempo real de sinais vitais, quedas e emergências com tecnologia inteligente.
        </p>
      </div>

    </section>
  );
};

export default BannerSlides;