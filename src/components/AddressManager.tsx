import React, { useState, useEffect } from 'react';
import { UserAddress } from '../types';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

interface AddressManagerProps {
  addresses: UserAddress[];
  onUpdateAddresses: (addresses: UserAddress[]) => void;
}

const GOOGLE_MAPS_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  '';

export const AddressManager: React.FC<AddressManagerProps> = ({
  addresses,
  onUpdateAddresses,
}) => {
  const [addressList, setAddressList] = useState<UserAddress[]>(addresses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  // Form states
  const [title, setTitle] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [flatNo, setFlatNo] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [pincode, setPincode] = useState('400001');
  const [lat, setLat] = useState(19.076);
  const [lng, setLng] = useState(72.8777);
  const [isDefault, setIsDefault] = useState(false);

  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setAddressList(addresses);
  }, [addresses]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleOpenNew = () => {
    setEditingAddress(null);
    setTitle('Home');
    setFlatNo('');
    setAddressLine('');
    setLandmark('');
    setCity('Mumbai');
    setPincode('400001');
    setLat(19.076);
    setLng(72.8777);
    setIsDefault(addressList.length === 0);
    setIsFormOpen(true);
  };

  const handleEdit = (addr: UserAddress) => {
    setEditingAddress(addr);
    setTitle(addr.title || 'Home');
    setFlatNo(addr.flatNo || '');
    setAddressLine(addr.addressLine || '');
    setLandmark(addr.landmark || '');
    setCity(addr.city || 'Mumbai');
    setPincode(addr.pincode || '400001');
    setLat(addr.lat || 19.076);
    setLng(addr.lng || 72.8777);
    setIsDefault(Boolean(addr.isDefault));
    setIsFormOpen(true);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          setLat(userLat);
          setLng(userLng);
          showToast('Updated pin to your current GPS coordinates!');
        },
        () => {
          showToast('Geolocation permission denied or unavailable.');
        }
      );
    } else {
      showToast('Geolocation is not supported by your browser.');
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine.trim() || !city.trim() || !pincode.trim()) {
      showToast('Please fill in Address Line, City, and Pincode.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        flatNo,
        addressLine,
        landmark,
        city,
        pincode,
        lat,
        lng,
        isDefault,
      };

      const token = localStorage.getItem('cookmantra_jwt_token') || '';
      const url = editingAddress?._id || editingAddress?.id
        ? `/api/v1/user/addresses/${editingAddress._id || editingAddress.id}`
        : '/api/v1/user/addresses';

      const method = editingAddress?._id || editingAddress?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.addresses) {
        setAddressList(data.addresses);
        onUpdateAddresses(data.addresses);
        showToast(editingAddress ? 'Address updated!' : 'New address added successfully!');
        setIsFormOpen(false);
      } else {
        showToast(data.message || 'Failed to save address');
      }
    } catch (err: any) {
      showToast('Error saving address');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const token = localStorage.getItem('cookmantra_jwt_token') || '';
      const res = await fetch(`/api/v1/user/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.addresses) {
        setAddressList(data.addresses);
        onUpdateAddresses(data.addresses);
        showToast('Address deleted.');
      }
    } catch (e) {
      showToast('Error deleting address');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-amber-400 font-bold px-4 py-2 rounded-xl text-xs shadow-xl border border-amber-500/30">
          {toastMsg}
        </div>
      )}

      <div className="flex justify-between items-center bg-white dark:bg-[#161618] p-4 rounded-2xl border border-zinc-200 dark:border-[#2D2D30]">
        <div>
          <h3 className="font-extrabold text-gray-900 dark:text-white text-base flex items-center gap-2">
            <i className="fas fa-map-marked-alt text-amber-500"></i> My Saved Delivery Addresses
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage your kitchen service locations and Google Maps pin points.
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold px-4 py-2 rounded-xl text-xs transition shadow-sm cursor-pointer flex items-center gap-1.5"
        >
          <i className="fas fa-plus"></i>
          <span>Add New Address</span>
        </button>
      </div>

      {/* Addresses Grid */}
      {addressList.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#161618] rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-6">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
            <i className="fas fa-location-arrow"></i>
          </div>
          <h4 className="font-bold text-sm text-gray-900 dark:text-white">No Addresses Saved Yet</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto mt-1 mb-4">
            Save home, office or event venue addresses for instant chef bookings.
          </p>
          <button
            onClick={handleOpenNew}
            className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold px-4 py-2 rounded-xl text-xs shadow-md transition cursor-pointer"
          >
            + Add First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addressList.map((addr) => {
            const addrId = addr._id || addr.id || '';
            return (
              <div
                key={addrId}
                className={`p-4 rounded-2xl bg-white dark:bg-[#161618] border ${
                  addr.isDefault
                    ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                    : 'border-zinc-200 dark:border-[#2D2D30]'
                } flex flex-col justify-between space-y-3 relative group`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <i
                        className={`fas ${
                          addr.title === 'Home'
                            ? 'fa-home'
                            : addr.title === 'Work'
                            ? 'fa-briefcase'
                            : 'fa-map-marker-alt'
                        }`}
                      ></i>
                      {addr.title}
                    </span>

                    {addr.isDefault && (
                      <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <i className="fas fa-check-circle"></i> Default
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-extrabold text-gray-900 dark:text-white line-clamp-1">
                    {addr.flatNo ? `${addr.flatNo}, ` : ''}
                    {addr.addressLine}
                  </p>
                  {addr.landmark && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      Landmark: {addr.landmark}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1 font-medium">
                    {addr.city} - {addr.pincode}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 font-mono">
                    GPS Pin: {addr.lat?.toFixed(4)}, {addr.lng?.toFixed(4)}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-xs">
                  <button
                    onClick={() => handleEdit(addr)}
                    className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    <i className="fas fa-pen text-[10px] mr-1"></i> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addrId)}
                    className="text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                  >
                    <i className="fas fa-trash text-[10px] mr-1"></i> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Address Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#18181b] rounded-3xl max-w-lg w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative my-auto">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs"
            >
              <i className="fas fa-times"></i>
            </button>

            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-1">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Pin exact location on Google Maps for accurate chef arrival.
            </p>

            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Address Label
                </label>
                <div className="flex gap-2">
                  {(['Home', 'Work', 'Other'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTitle(t)}
                      className={`flex-1 py-2 rounded-xl font-bold transition border ${
                        title === t
                          ? 'bg-amber-500 text-gray-950 border-amber-500 shadow-xs'
                          : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    House / Flat / Building No.
                  </label>
                  <input
                    type="text"
                    value={flatNo}
                    onChange={(e) => setFlatNo(e.target.value)}
                    placeholder="e.g. Flat 402, Royal Residency"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Metro Station"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Street Address Line <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="Street name, Area, Colony"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai / Pune / Delhi"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="400001"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Map Location Picker */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-gray-700 dark:text-gray-300">
                    Google Maps Pin Coordinate
                  </label>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <i className="fas fa-crosshairs text-amber-500"></i>
                    <span>Use My Current GPS</span>
                  </button>
                </div>

                <div className="h-40 rounded-2xl overflow-hidden border border-zinc-300 dark:border-zinc-700 relative bg-zinc-800">
                  {GOOGLE_MAPS_KEY ? (
                    <APIProvider apiKey={GOOGLE_MAPS_KEY} version="weekly">
                      <Map
                        defaultCenter={{ lat, lng }}
                        center={{ lat, lng }}
                        defaultZoom={13}
                        mapId="COOKMANTRA_ADDRESS_MAP"
                        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                        style={{ width: '100%', height: '100%' }}
                      >
                        <AdvancedMarker position={{ lat, lng }}>
                          <Pin background="#f59e0b" glyphColor="#ffffff" />
                        </AdvancedMarker>
                      </Map>
                    </APIProvider>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-zinc-900 text-zinc-300">
                      <i className="fas fa-map-marked-alt text-amber-500 text-2xl mb-1"></i>
                      <p className="font-bold text-xs">Interactive Pin Location</p>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isDefaultCheck"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded accent-amber-500"
                />
                <label htmlFor="isDefaultCheck" className="text-gray-700 dark:text-gray-300 font-semibold cursor-pointer">
                  Set as my default primary address
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 font-bold text-gray-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold transition shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i> Save Address
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
