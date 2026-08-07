import React, { useState } from 'react';
import { HeroSlider } from './HeroSlider';
import { FlashDeal } from './FlashDeal';
import { HOME_SERVICES, SPECIAL_MOMENTS, COMBO_PACKAGES, TOP_PROFESSIONALS } from '../data/recipes';

interface HomeSectionProps {
  onOpenBooking: () => void;
  setActiveSection: (sec: string) => void;
  onQuickOrder?: (serviceDetail: string, serviceType?: string, price?: string) => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({ onOpenBooking, setActiveSection, onQuickOrder }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const query = searchQuery.trim().toLowerCase();

  const filterItem = (searchData: string) => {
    if (!query) return true;
    return searchData.toLowerCase().includes(query);
  };

  const cuisines = [
    { name: 'North Indian', img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=300&auto=format&fit=crop', keywords: 'north indian curry naan butter chicken' },
    { name: 'Chinese', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=300&auto=format&fit=crop', keywords: 'chinese noodles fried rice dim sum' },
    { name: 'Italian', img: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=300&auto=format&fit=crop', keywords: 'italian pasta pizza risotto' },
    { name: 'Continental', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=300&auto=format&fit=crop', keywords: 'continental steak grilled fish' },
    { name: 'Barbecue', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=300&auto=format&fit=crop', keywords: 'barbecue bbq grilled meat' },
    { name: 'South Indian', img: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=300&auto=format&fit=crop', keywords: 'south indian dosa idli sambar' },
    { name: 'Thai', img: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=300&auto=format&fit=crop', keywords: 'thai curry pad thai' },
    { name: 'Vrat ka Khana', img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=300&auto=format&fit=crop', keywords: 'vrat ka khana fasting food sabudana' },
  ];

  const visibleServices = HOME_SERVICES.filter(s => filterItem(s.searchData));
  const visibleMoments = SPECIAL_MOMENTS.filter(m => filterItem(m.searchData));
  const visiblePackages = COMBO_PACKAGES.filter(p => filterItem(p.searchData));
  const visibleProfessionals = TOP_PROFESSIONALS.filter(p => filterItem(p.searchData));
  const visibleCuisines = cuisines.filter(c => filterItem(`${c.name} ${c.keywords}`));

  const hasAnyResults =
    visibleServices.length > 0 ||
    visibleMoments.length > 0 ||
    visiblePackages.length > 0 ||
    visibleProfessionals.length > 0 ||
    visibleCuisines.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Global Search Bar */}
      <section className="relative">
        <div className="relative text-gray-600 dark:text-gray-400">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
            <i className="fas fa-search"></i>
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full py-3.5 pl-11 pr-12 text-sm text-gray-900 dark:text-white bg-white dark:bg-[#161618] rounded-2xl shadow-sm border border-zinc-200 dark:border-[#2D2D30] focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
            placeholder="Search cuisines, chefs, dishes, services, moments..."
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <i className="fas fa-times-circle text-lg"></i>
            </button>
          )}
        </div>

        {query && !hasAnyResults && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white dark:bg-[#161618] rounded-2xl border border-zinc-200 dark:border-[#2D2D30] mt-4 shadow-sm">
            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-3 text-amber-500">
              <i className="fas fa-utensils text-2xl"></i>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No matching items found</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
              Try adjusting your search terms or explore our top categories below.
            </p>
          </div>
        )}
      </section>

      {/* Hero Slider */}
      {filterItem('italian pasta masterclass pizza global flavors event catering') && (
        <HeroSlider onOpenBooking={onOpenBooking} setActiveSection={setActiveSection} onQuickOrder={onQuickOrder} />
      )}

      {/* Deal of the Day Banner */}
      {filterItem('italian cuisine masterclass chef giovanni pasta deal 50% off') && (
        <FlashDeal onOpenBooking={onOpenBooking} onQuickOrder={onQuickOrder} />
      )}

      {/* Home Services */}
      {visibleServices.length > 0 && (
        <section id="homeServicesSection" className="pt-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white text-xl">Home Services</h3>
            <button
              onClick={onOpenBooking}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              Book Custom Service <i className="fas fa-arrow-right text-[10px]"></i>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleServices.map(service => (
              <div
                key={service.id}
                className="card-hover bg-white dark:bg-[#161618] rounded-2xl p-5 shadow-sm hover:shadow-xl border border-zinc-200 dark:border-[#2D2D30] hover:border-amber-500/40 relative overflow-hidden group flex flex-col justify-between transition-all duration-300"
              >
                {service.badge && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold uppercase rounded-full shadow-md">
                      {service.badge}
                    </span>
                  </div>
                )}
                <div>
                  <div className="img-hover-zoom rounded-xl overflow-hidden h-44 mb-4">
                    <img
                      src={service.img}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{service.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{service.description}</p>
                  <ul className="space-y-2 mb-4">
                    {service.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center text-xs text-gray-700 dark:text-gray-300">
                        <i className="fas fa-check-circle text-emerald-500 mr-2"></i>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-[#27272A]">
                  <span className="font-bold text-sm text-amber-600 dark:text-amber-400">{service.price}</span>
                  <button
                    onClick={() => {
                      if (onQuickOrder) {
                        onQuickOrder(service.title, 'Home Service', service.price);
                      } else {
                        onOpenBooking();
                      }
                    }}
                    className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center hover:bg-amber-500 hover:text-white transition cursor-pointer"
                  >
                    <i className="fas fa-arrow-right text-xs"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Special Moments */}
      {visibleMoments.length > 0 && (
        <section id="specialMomentsSection" className="pt-2">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 gap-2">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-xl md:text-2xl">Life’s Special Moments</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Curated experiences for your best memories</p>
            </div>
            <button
              onClick={onOpenBooking}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              View All Occasions <i className="fas fa-arrow-right text-[10px]"></i>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-3 sm:gap-4">
            {visibleMoments.map(moment => (
              <div
                key={moment.id}
                onClick={() => {
                  if (onQuickOrder) {
                    onQuickOrder(moment.title, 'Special Moment');
                  } else {
                    onOpenBooking();
                  }
                }}
                className={`${moment.gridClass} relative rounded-2xl md:rounded-3xl border border-zinc-200 dark:border-[#2D2D30] overflow-hidden group cursor-pointer shadow-md hover:border-amber-500/50 transition-all duration-300`}
              >
                <img
                  src={moment.img}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  alt={moment.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 md:p-6 flex flex-col justify-end">
                  {moment.badge && (
                    <span className="bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded w-fit mb-2 uppercase">
                      {moment.badge}
                    </span>
                  )}
                  <h4 className="text-lg md:text-2xl font-bold text-white mb-0.5">{moment.title}</h4>
                  <p className="text-gray-200 text-xs line-clamp-2 mb-3">{moment.subtitle}</p>
                  {moment.buttonText && (
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/40 font-semibold py-1.5 px-4 text-xs rounded-xl transition-all w-fit">
                      {moment.buttonText}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Premium Packages */}
      {visiblePackages.length > 0 && (
        <section className="rounded-3xl bg-zinc-50 dark:bg-[#121214] p-5 sm:p-6 md:p-8 border border-zinc-200 dark:border-[#2D2D30]">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-xs font-semibold mb-3 shadow">
              <i className="fas fa-crown mr-1.5"></i>Premium Packages
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Complete Experience Packages</h3>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Save up to 30% with all-inclusive chef & service combos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {visiblePackages.map(pkg => (
              <div
                key={pkg.id}
                className={`bg-white dark:bg-[#161618] rounded-2xl p-6 shadow-lg border relative flex flex-col justify-between ${
                  pkg.isPopular
                    ? 'border-2 border-amber-500 transform lg:-translate-y-2'
                    : 'border-zinc-200 dark:border-[#2D2D30]'
                }`}
              >
                {pkg.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full shadow">
                      {pkg.badge}
                    </span>
                  </div>
                )}
                <div>
                  <div className="rounded-xl overflow-hidden h-40 mb-4">
                    <img src={pkg.img} alt={pkg.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="text-center mb-4">
                    <span className="inline-block px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-semibold mb-2">
                      {pkg.title}
                    </span>
                    <div className="flex justify-center items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">{pkg.price}</span>
                      <span className="text-xs text-gray-400 line-through">{pkg.originalPrice}</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-500">{pkg.discount}</span>
                  </div>

                  <ul className="space-y-2.5 mb-6 text-xs text-gray-700 dark:text-gray-300">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center">
                        <i className="fas fa-check-circle text-emerald-500 mr-2"></i>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    if (onQuickOrder) {
                      onQuickOrder(pkg.title, 'Combo Package', pkg.price);
                    } else {
                      onOpenBooking();
                    }
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition shadow cursor-pointer ${
                    pkg.isPopular
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-95'
                      : 'bg-zinc-900 dark:bg-zinc-800 text-white hover:bg-zinc-800'
                  }`}
                >
                  Book {pkg.title}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Worldwide Cuisines */}
      {visibleCuisines.length > 0 && (
        <section className="bg-white dark:bg-[#161618] rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-[#2D2D30]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Worldwide Cuisines</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Choose from 15+ authentic global cuisines</p>
            </div>
            <button
              onClick={() => setActiveSection('coursesSection')}
              className="text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white font-semibold px-4 py-2 rounded-xl transition"
            >
              View Full Menu
            </button>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
            {visibleCuisines.map((c, idx) => (
              <div
                key={idx}
                onClick={() => setActiveSection('coursesSection')}
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2 border-2 border-zinc-100 dark:border-zinc-800 group-hover:border-amber-400 group-hover:shadow-lg transition">
                  <img src={c.img} className="w-full h-full object-cover group-hover:scale-110 transition" alt={c.name} />
                </div>
                <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-amber-500 leading-tight">
                  {c.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top Rated Professionals */}
      {visibleProfessionals.length > 0 && (
        <section className="bg-white dark:bg-[#121214] text-gray-900 dark:text-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm border border-zinc-200 dark:border-[#2D2D30] relative overflow-hidden transition-colors">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">Top Rated Professionals</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Background Checked & Certified Chefs and Crew</p>
            </div>
            <button
              onClick={() => {
                if (onQuickOrder) {
                  onQuickOrder('Top Rated Professional Chef & Crew', 'Chef Service');
                } else {
                  onOpenBooking();
                }
              }}
              className="text-xs bg-amber-500 hover:bg-amber-600 text-gray-950 px-4 py-2 rounded-xl font-extrabold shadow-sm hover:shadow transition cursor-pointer active:scale-95"
            >
              Book Professional
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {visibleProfessionals.map(pro => (
              <div
                key={pro.id}
                onClick={() => {
                  if (onQuickOrder) {
                    onQuickOrder(`${pro.role} • ${pro.name}`, 'Professional Service');
                  } else {
                    onOpenBooking();
                  }
                }}
                className="flex flex-col items-center text-center group p-4 bg-gray-50 dark:bg-[#18181b] rounded-2xl border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-amber-500 dark:hover:border-amber-400 transition-all shadow-2xs hover:shadow-md"
              >
                <div className="relative mb-2">
                  <img
                    src={pro.img}
                    className="rounded-full w-20 h-20 sm:w-24 sm:h-24 object-cover border-2 border-amber-400 group-hover:scale-105 transition"
                    alt={pro.name}
                  />
                  <span className="absolute bottom-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                    {pro.rating} <i className="fas fa-star text-[8px]"></i>
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{pro.name}</h4>
                <p className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5">{pro.role}</p>
                <span className="text-[10px] text-gray-500 dark:text-zinc-500">{pro.exp}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
