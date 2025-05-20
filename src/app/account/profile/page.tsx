'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAddress } from '@/hooks/useAddress';
import AddressForm from '@/components/checkout/AddressForm';
import { AddressFormData } from '@/models/Address';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { addresses, loading, addAddress, updateAddress, deleteAddress } = useAddress(user?.uid);
  
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Client-side only rendering to prevent hydration errors
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isClient && !isAuthenticated) {
      router.push('/login?redirect=account/profile');
    }
  }, [isClient, isAuthenticated, router]);

  const handleAddAddress = async (addressData: AddressFormData) => {
    if (!user?.uid) return;
    
    try {
      await addAddress(addressData);
      setIsAddingAddress(false);
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  const handleUpdateAddress = async (addressId: string, addressData: Partial<AddressFormData>) => {
    try {
      await updateAddress(addressId, addressData);
      setEditingAddressId(null);
    } catch (error) {
      console.error('Error updating address:', error);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(addressId);
      } catch (error) {
        console.error('Error deleting address:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!isClient || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#EFEAE6] py-16 px-4 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B1113]"></div>
        <p className="mt-4 text-[#4B423A]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFEAE6] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white border border-[#CFC5BA] rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-4 mb-6">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#0E1C4C] flex items-center justify-center text-white text-xl font-bold">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-[#0E1C4C]">{user?.displayName || 'User'}</h2>
                  <p className="text-sm text-[#4B423A]">{user?.email}</p>
                </div>
              </div>
              
              <nav className="space-y-2">
                <a 
                  href="/account/profile" 
                  className="block py-2 px-4 rounded-lg bg-[#F5F2EF] text-[#0E1C4C] font-medium"
                >
                  Profile
                </a>
                <a 
                  href="/account/orders" 
                  className="block py-2 px-4 rounded-lg hover:bg-[#F5F2EF] text-[#4B423A] transition-colors"
                >
                  Orders
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 px-4 rounded-lg hover:bg-[#F5F2EF] text-[#7B1113] transition-colors"
                >
                  Sign Out
                </button>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:w-3/4">
            <div className="bg-white border border-[#CFC5BA] rounded-xl shadow-lg p-6">
              <h1 className="text-2xl font-bold text-[#0E1C4C] mb-6">Your Profile</h1>
              
              {/* User Information */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-[#0E1C4C] mb-4">Account Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#4B423A]">Name</p>
                    <p className="font-medium text-[#0E1C4C]">{user?.displayName || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#4B423A]">Email</p>
                    <p className="font-medium text-[#0E1C4C]">{user?.email}</p>
                  </div>
                </div>
              </div>
              
              {/* Addresses */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-[#0E1C4C]">Your Addresses</h2>
                  {!isAddingAddress && (
                    <button
                      onClick={() => setIsAddingAddress(true)}
                      className="text-[#7B1113] hover:text-[#921518] font-medium flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Add New Address
                    </button>
                  )}
                </div>
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B1113]"></div>
                  </div>
                ) : isAddingAddress ? (
                  <div className="border border-[#CFC5BA] rounded-lg p-4 mb-4">
                    <h3 className="text-md font-semibold text-[#0E1C4C] mb-4">Add New Address</h3>
                    <AddressForm 
                      onSubmit={handleAddAddress} 
                      loading={loading}
                    />
                    <button
                      onClick={() => setIsAddingAddress(false)}
                      className="mt-4 text-[#4B423A] hover:text-[#0E1C4C] font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                ) : editingAddressId ? (
                  <div className="border border-[#CFC5BA] rounded-lg p-4 mb-4">
                    <h3 className="text-md font-semibold text-[#0E1C4C] mb-4">Edit Address</h3>
                    <AddressForm 
                      onSubmit={(data) => handleUpdateAddress(editingAddressId, data)} 
                      initialData={addresses.find(addr => addr.id === editingAddressId)}
                      loading={loading}
                      buttonText="Update Address"
                    />
                    <button
                      onClick={() => setEditingAddressId(null)}
                      className="mt-4 text-[#4B423A] hover:text-[#0E1C4C] font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div 
                        key={address.id} 
                        className="border border-[#CFC5BA] rounded-lg p-4 hover:border-[#0E1C4C] transition-colors"
                      >
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium text-[#0E1C4C]">{address.fullName}</p>
                            <p className="text-[#4B423A] mt-1">{address.phoneNumber}</p>
                            <p className="text-[#4B423A] mt-2">{address.addressLine1}</p>
                            {address.addressLine2 && <p className="text-[#4B423A]">{address.addressLine2}</p>}
                            <p className="text-[#4B423A]">{address.city}, {address.state}, {address.postalCode}</p>
                            <p className="text-[#4B423A]">{address.country}</p>
                          </div>
                          <div className="flex flex-col space-y-2">
                            {address.isDefault && (
                              <span className="bg-[#E6E1DC] text-[#4B423A] text-xs px-2 py-1 rounded self-start">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex mt-4 space-x-4">
                          <button
                            onClick={() => setEditingAddressId(address.id || null)}
                            className="text-[#0E1C4C] hover:text-[#1A2C5C] text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id!)}
                            className="text-[#7B1113] hover:text-[#921518] text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-[#CFC5BA] rounded-lg">
                    <p className="text-[#4B423A]">You don't have any saved addresses yet.</p>
                    <button
                      onClick={() => setIsAddingAddress(true)}
                      className="mt-4 px-4 py-2 bg-[#7B1113] hover:bg-[#921518] text-white rounded-lg font-medium transition-colors"
                    >
                      Add Your First Address
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
