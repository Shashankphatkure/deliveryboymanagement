// app/add-customer/page.js
"use client";

import React, { useState } from "react";
import { supabase } from "../../utils/supabase/client";

export default function AddCustomerPage() {
  const initialFormState = {
    name: "",
    phone: "",
    homeaddress: "",
    city: "",
    email: "",
    workaddress: "",
    status: "active",
    ordernote: "",
    subscriptiondays: "",
    subscriptionstart: "",
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
      const { data, error } = await supabase
        .from("customers")
        .insert([formData]);

      if (error) throw error;

      setSuccessMessage("Customer added successfully!");
      setFormData(initialFormState);
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Failed to add customer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAnother = () => {
    setFormData(initialFormState);
    setSuccessMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
            Add New Customer
          </h1>
          {successMessage && (
            <div
              className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4"
              role="alert"
            >
              <p>{successMessage}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700"
                >
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  id="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="homeaddress"
                  className="block text-sm font-medium text-gray-700"
                >
                  Home Address
                </label>
                <input
                  type="text"
                  name="homeaddress"
                  id="homeaddress"
                  value={formData.homeaddress}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="workaddress"
                  className="block text-sm font-medium text-gray-700"
                >
                  Work Address
                </label>
                <input
                  type="text"
                  name="workaddress"
                  id="workaddress"
                  value={formData.workaddress}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  name="status"
                  id="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="ordernote"
                  className="block text-sm font-medium text-gray-700"
                >
                  Order Note
                </label>
                <textarea
                  name="ordernote"
                  id="ordernote"
                  rows="3"
                  value={formData.ordernote}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="subscriptiondays"
                  className="block text-sm font-medium text-gray-700"
                >
                  Subscription Days
                </label>
                <input
                  type="number"
                  name="subscriptiondays"
                  id="subscriptiondays"
                  value={formData.subscriptiondays}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="subscriptionstart"
                  className="block text-sm font-medium text-gray-700"
                >
                  Subscription Start
                </label>
                <input
                  type="date"
                  name="subscriptionstart"
                  id="subscriptionstart"
                  value={formData.subscriptionstart}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleAddAnother}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Another
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLoading ? "Adding..." : "Add Customer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
