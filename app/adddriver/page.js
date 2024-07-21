"use client";

import React, { useState } from "react";
import { supabase } from "../../utils/supabase/client";
import {
  Camera,
  User,
  Truck,
  MapPin,
  CreditCard,
  Settings,
} from "lucide-react";

export default function AddDriverPage() {
  const initialFormState = {
    name: "",
    age: "",
    phone: "",
    photo: "",
    email: "",
    aadharno: "",
    "Pancard number": "",
    "Driving License": "",
    address: "",
    city: "",
    vehiclenumber: "",
    vehicle: "",
    vehiclecolor: "",
    bankaccountno: "",
    bankifsccode: "",
    status: "active",
    aboutdriver: "",
    homephonenumber: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("drivers").insert([formData]);

      if (error) throw error;

      setSuccessMessage("Driver added successfully!");
      setFormData(initialFormState);
    } catch (error) {
      console.error("Error adding driver:", error);
      alert("Failed to add driver. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAnother = () => {
    setFormData(initialFormState);
    setSuccessMessage("");
  };

  const FormSection = ({ title, icon, children }) => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </h2>
      <div className="bg-white p-6 rounded-lg shadow-md">{children}</div>
    </div>
  );

  const InputField = ({ label, name, type = "text" }) => (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={formData[name]}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
          Add New Driver
        </h1>
        {successMessage && (
          <div
            className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md"
            role="alert"
          >
            <p>{successMessage}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-8">
          <FormSection
            title="Personal Information"
            icon={<User className="w-6 h-6" />}
          >
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <InputField label="Name" name="name" />
              <InputField label="Age" name="age" />
              <InputField label="Phone" name="phone" />
              <InputField label="Email" name="email" type="email" />
              <InputField label="Home Phone Number" name="homephonenumber" />
            </div>
          </FormSection>

          <FormSection
            title="Identity Documents"
            icon={<Camera className="w-6 h-6" />}
          >
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <InputField label="Aadhar Number" name="aadharno" />
              <InputField label="PAN Card Number" name="Pancard number" />
              <InputField label="Driving License" name="Driving License" />
              <div className="sm:col-span-2">
                <label
                  htmlFor="photo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Photo
                </label>
                <input
                  type="file"
                  name="photo"
                  id="photo"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Address Information"
            icon={<MapPin className="w-6 h-6" />}
          >
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <InputField label="Address" name="address" />
              </div>
              <InputField label="City" name="city" />
            </div>
          </FormSection>

          <FormSection
            title="Vehicle Information"
            icon={<Truck className="w-6 h-6" />}
          >
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <InputField label="Vehicle Number" name="vehiclenumber" />
              <InputField label="Vehicle Type" name="vehicle" />
              <InputField label="Vehicle Color" name="vehiclecolor" />
            </div>
          </FormSection>

          <FormSection
            title="Bank Details"
            icon={<CreditCard className="w-6 h-6" />}
          >
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <InputField label="Bank Account Number" name="bankaccountno" />
              <InputField label="Bank IFSC Code" name="bankifsccode" />
            </div>
          </FormSection>

          <FormSection
            title="Additional Information"
            icon={<Settings className="w-6 h-6" />}
          >
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status
                </label>
                <select
                  name="status"
                  id="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="aboutdriver"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  About Driver
                </label>
                <textarea
                  name="aboutdriver"
                  id="aboutdriver"
                  rows="3"
                  value={formData.aboutdriver}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </FormSection>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleAddAnother}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
            >
              Add Another
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
            >
              {isLoading ? "Adding..." : "Add Driver"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
