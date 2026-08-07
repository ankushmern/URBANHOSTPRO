import React, { useState, useEffect } from 'react';

interface HeroSliderProps {
  onOpenBooking: () => void;
  setActiveSection: (sec: string) => void;
  onQuickOrder?: (serviceDetail: string, serviceType?: string, price?: string) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ onOpenBooking, setActiveSection, onQuickOrder }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'Master Italian Cuisine',
      description: 'Learn authentic pasta making and Italian cooking techniques from expert executive chefs.',
      img: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop',
      btnText: 'Start Cooking',
      btnBg: 'bg-yellow-500 hover:bg-yellow-600',
      action: () => setActiveSection('coursesSection'),
      objectPos: 'object-center',
    },
    {
      title: 'Explore Global Flavors',
      description: 'Discover diverse cuisines and cooking styles crafted by professional chefs.',
      img: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=2070&auto=format&fit=crop',
      btnText: 'Browse Recipes',
      btnBg: 'bg-green-500 hover:bg-green-600',
      action: () => setActiveSection('savedRecipesSection'),
      objectPos: 'object-center',
    },
    {
      title: 'Host Perfect Events',
      description: 'Professional catering, private chef hire, and event services for memorable occasions.',
      img: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop',
      btnText: 'Book Service',
      btnBg: 'bg-red-500 hover:bg-red-600',
      action: () => {
        if (onQuickOrder) {
          onQuickOrder('Event Catering & Private Host Service', 'Event Service');
        } else {
          onOpenBooking();
        }
      },
      objectPos: 'object-center',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="w-full mx-auto relative group mt-2" data-search="italian pasta masterclass pizza global flavors event catering">
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-xl h-[280px] sm:h-[380px] md:h-[450px]">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img src={slide.img} className={`w-full h-full object-cover ${slide.objectPos || 'object-center'}`} alt={slide.title} loading="lazy" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-4 sm:p-6 md:p-10">
              <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-white text-shadow mb-1 sm:mb-2">{slide.title}</h2>
              <p className="text-xs sm:text-sm md:text-lg text-white/90 text-shadow max-w-2xl mb-3 sm:mb-4 leading-relaxed line-clamp-2 sm:line-clamp-none">{slide.description}</p>
              <button
                onClick={slide.action}
                className={`${slide.btnBg} text-white text-xs md:text-sm font-bold py-2 px-5 sm:py-2.5 sm:px-6 rounded-xl w-fit shadow-lg transform hover:scale-105 transition-all cursor-pointer`}
              >
                {slide.btnText}
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={() => setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1))}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full z-20 text-white transition-colors"
          aria-label="Previous slide"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <button
          onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full z-20 text-white transition-colors"
          aria-label="Next slide"
        >
          <i className="fas fa-chevron-right"></i>
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Slide ${idx + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
};
