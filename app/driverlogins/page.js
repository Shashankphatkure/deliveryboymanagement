// app/users/page.js
"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

// Initialize the Supabase client
const supabaseUrl = "https://sxgahulciuptxhpvdkcv.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4Z2FodWxjaXVwdHhocHZka2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk0MTAxMjcsImV4cCI6MjAyNDk4NjEyN30.8bUu7eSxcN30rYwtF576HeQnfaBUKVNpHEYPFugQqo8";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        // Simple connection test
        const { error: connectionError } = await supabase
          .from("auth.users")
          .select("email", { count: "exact", head: true });

        if (connectionError) {
          throw new Error(
            `Supabase connection error: ${connectionError.message}`
          );
        }

        // If connection is successful, proceed to fetch users
        const { data, error } = await supabase.rpc("get_users");
        if (error) throw error;
        setUsers(data);
      } catch (e) {
        console.error("Error fetching users:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const isToday = (date) => {
    const today = new Date();
    const checkDate = new Date(date);
    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
        All Active Drivers Today
      </h1>
      {users.length === 0 ? (
        <p className="text-center text-gray-600 text-xl">No users found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden transition duration-300 ease-in-out transform hover:scale-105"
            >
              <div className="p-6">
                <p className="text-xl font-semibold text-gray-800 mb-2 truncate">
                  {user.email}
                </p>
                <p
                  className={`text-sm ${
                    isToday(user.last_sign_in_at)
                      ? "text-green-600 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  <span className="font-medium">Last Login:</span>{" "}
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleString()
                    : "Never"}
                </p>
              </div>
              <div className="bg-gray-50 px-6 py-4"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
