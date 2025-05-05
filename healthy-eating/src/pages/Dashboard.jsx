import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const featuresRef = useRef(null);

  const slides = [
    { id: 1, src: "/banner1.jpg", alt: "Баннер 1", title: "Йогуртовый мусс", description: "Нежнейший десерт с йогуртом и ягодами", 
      link: "/recipe/18" },
    { id: 2, src: "/banner2.jpg", alt: "Баннер 2", title: "Цезарь с курицей", description: "Классический салат с курицей и соусом Цезарь", 
      link: "/recipe/1"  }, 
    { id: 3, src: "/banner3.jpg", alt: "Баннер 3", title: "Рис с овощами и тофу", description: "Полезный и сытный обед", 
      link: "/recipe/13"  },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 6000); 
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFeaturesVisible(true);
          observer.disconnect(); 
        }
      },
      { threshold: 0.3 }
    );

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    return () => {
      if (featuresRef.current) {
        observer.unobserve(featuresRef.current);
      }
    };
  }, []);
  

  return (
    <div className="dashboard-container">
        <div className="dashboard-hero">
          <div className="hero__text">
            <h1>Healthy Eating</h1>
            <h3>Планируйте питание с нами!</h3>
            <Link to="/meal-planner" className="main__button">
              Начать планирование
            </Link>
          </div>
      </div>

      <section className="dashboard-features" ref={featuresRef}>
  <h2>Что мы предлагаем</h2>
  <div className="features-grid">
    
    <div className="feature-wrapper">
      <span className="feature-number">01</span>
      <div className={`feature-card ${featuresVisible ? "visible" : ""}`}>
        <div className="feature-header">
          <img src="/feature_icon_1.jpg" alt="Планировщик" className="feature-icon" />
          <h3>Планировщик питания</h3>
        </div>
        <p>Создавайте персонализированные планы питания на каждый день недели</p>
        <Link to="/meal-planner" className="main__button feature-button">Подробнее</Link>
      </div>
    </div>

    <div className="feature-wrapper">
      <span className="feature-number">02</span>
      <div className={`feature-card ${featuresVisible ? "visible" : ""}`}>
        <div className="feature-header">
          <img src="/feature_icon_2.jpg" alt="Рецепты" className="feature-icon" />
          <h3>Каталог рецептов</h3>
        </div>
        <p>Откройте для себя вкусные и полезные рецепты, подходящие для вашей диеты</p>
        <Link to="/catalog" className="main__button feature-button">Посмотреть рецепты</Link>
      </div>
    </div>

    <div className="feature-wrapper">
      <span className="feature-number">03</span>
      <div className={`feature-card ${featuresVisible ? "visible" : ""}`}>
        <div className="feature-header">
          <img src="/feature_icon_3.jpg" alt="Кабинет" className="feature-icon" />
          <h3>Личный кабинет</h3>
        </div>
        <p>Отслеживайте свои планы питания и сохраняйте любимые рецепты</p>
        <Link to="/profile" className="main__button feature-button">Перейти в кабинет</Link>
      </div>
    </div>

  </div>
</section>




      <div className="dashboard-carousel">
        <div className="carousel-slides">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`carousel-slide ${index === currentSlide ? "active" : ""}`}
            style={{ display: index === currentSlide ? "block" : "none" }}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className="carousel-image"
            />
          <div className="carousel-overlay">
            <h2>{slide.title}</h2>
            <p>{slide.description}</p>
            <a href={slide.link} className="cta-button">Посмотреть рецепт</a>
          </div>
          </div>
        ))}
        </div>
  <div className="carousel-dots">
    {slides.map((_, index) => (
      <button
        key={index}
        className={`dot ${index === currentSlide ? "active" : ""}`}
        onClick={() => goToSlide(index)}
      ></button>
    ))}
  </div>
</div>


      <section className="dashboard-popular">
        <h2>Популярные рецепты</h2>
        <div className="popular-recipes">
          <Link to="/recipe/1" className="popular-recipe-card">
            <img src="/salat.jpg" alt="Салат Цезарь" className="popular-recipe-image" />
            <h3>Салат Цезарь</h3>
            <p>Классический рецепт с низким содержанием калорий</p>
          </Link>
          <Link to="/recipe/10" className="popular-recipe-card">
            <img src="/kasha.jpg" alt="Овсянка с ягодами" className="popular-recipe-image" />
            <h3>Овсянка с ягодами</h3>
            <p>Идеальный завтрак для начала дня</p>
          </Link>
          <Link to="/recipe/5" className="popular-recipe-card">
            <img src="/chicken.avif" alt="Куриное филе на гриле" className="popular-recipe-image" />
            <h3>Куриное филе на гриле</h3>
            <p>Простой и полезный обед для вашей диеты</p>
          </Link>
          <Link to="/recipe/9" className="popular-recipe-card">
            <img src="/salmon.jpg" alt="Лосось на гриле с овощами" className="popular-recipe-image" />
            <h3>Лосось на гриле с овощами</h3>
            <p>Легкое и полезное блюдо с насыщенным вкусом</p>
          </Link>
        </div>
        <div className="popular-recipes-footer">
          <Link to="/catalog" className="btn-all-recipes">Все рецепты ➜</Link>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;