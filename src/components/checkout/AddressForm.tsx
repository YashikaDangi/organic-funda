'use client';

import React, { useState } from 'react';
import { AddressFormData } from '@/models/Address';

interface AddressFormProps {
  onSubmit: (addressData: AddressFormData) => void;
  initialData?: Partial<AddressFormData>;
  loading?: boolean;
  buttonText?: string;
}

const AddressForm: React.FC<AddressFormProps> = ({
  onSubmit,
  initialData = {},
  loading = false,
  buttonText = 'Save Address'
}) => {
  const [formData, setFormData] = useState<AddressFormData>({
    fullName: initialData.fullName || '',
    phoneNumber: initialData.phoneNumber || '',
    addressLine1: initialData.addressLine1 || '',
    addressLine2: initialData.addressLine2 || '',
    city: initialData.city || '',
    state: initialData.state || '',
    postalCode: initialData.postalCode || '',
    country: initialData.country || 'India',
    isDefault: initialData.isDefault || false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^\d{6}$/.test(formData.postalCode.trim())) {
      newErrors.postalCode = 'Please enter a valid 6-digit postal code';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // List of Indian states
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-[#4B423A]">
          Full Name *
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${errors.fullName ? 'border-red-500' : 'border-[#CFC5BA]'} py-2 px-3 shadow-sm focus:border-[#0E1C4C] focus:outline-none focus:ring-1 focus:ring-[#0E1C4C]`}
        />
        {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-[#4B423A]">
          Phone Number *
        </label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${errors.phoneNumber ? 'border-red-500' : 'border-[#CFC5BA]'} py-2 px-3 shadow-sm focus:border-[#0E1C4C] focus:outline-none focus:ring-1 focus:ring-[#0E1C4C]`}
        />
        {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
      </div>

      <div>
        <label htmlFor="addressLine1" className="block text-sm font-medium text-[#4B423A]">
          Address Line 1 *
        </label>
        <input
          type="text"
          id="addressLine1"
          name="addressLine1"
          value={formData.addressLine1}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${errors.addressLine1 ? 'border-red-500' : 'border-[#CFC5BA]'} py-2 px-3 shadow-sm focus:border-[#0E1C4C] focus:outline-none focus:ring-1 focus:ring-[#0E1C4C]`}
        />
        {errors.addressLine1 && <p className="mt-1 text-sm text-red-600">{errors.addressLine1}</p>}
      </div>

      <div>
        <label htmlFor="addressLine2" className="block text-sm font-medium text-[#4B423A]">
          Address Line 2
        </label>
        <input
          type="text"
          id="addressLine2"
          name="addressLine2"
          value={formData.addressLine2}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-[#CFC5BA] py-2 px-3 shadow-sm focus:border-[#0E1C4C] focus:outline-none focus:ring-1 focus:ring-[#0E1C4C]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-[#4B423A]">
            City *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.city ? 'border-red-500' : 'border-[#CFC5BA]'} py-2 px-3 shadow-sm focus:border-[#0E1C4C] focus:outline-none focus:ring-1 focus:ring-[#0E1C4C]`}
          />
          {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-[#4B423A]">
            State *
          </label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.state ? 'border-red-500' : 'border-[#CFC5BA]'} py-2 px-3 shadow-sm focus:border-[#0E1C4C] focus:outline-none focus:ring-1 focus:ring-[#0E1C4C]`}
          >
            <option value="">Select State</option>
            {indianStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-[#4B423A]">
            Postal Code *
          </label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.postalCode ? 'border-red-500' : 'border-[#CFC5BA]'} py-2 px-3 shadow-sm focus:border-[#0E1C4C] focus:outline-none focus:ring-1 focus:ring-[#0E1C4C]`}
          />
          {errors.postalCode && <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>}
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-[#4B423A]">
            Country *
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.country ? 'border-red-500' : 'border-[#CFC5BA]'} py-2 px-3 shadow-sm focus:border-[#0E1C4C] focus:outline-none focus:ring-1 focus:ring-[#0E1C4C]`}
            readOnly
          />
          {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isDefault"
          name="isDefault"
          checked={formData.isDefault}
          onChange={handleChange}
          className="h-4 w-4 text-[#0E1C4C] focus:ring-[#0E1C4C] border-[#CFC5BA] rounded"
        />
        <label htmlFor="isDefault" className="ml-2 block text-sm text-[#4B423A]">
          Set as default address
        </label>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#7B1113] hover:bg-[#921518] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B1113] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Saving...' : buttonText}
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
