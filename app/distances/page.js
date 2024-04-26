"use client";
import React, { useState } from "react";
import { supabase } from "../../utils/supabase/supabase";

const page = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("demodata")
      .select("locations")
      .eq("id", 2)
      .single();
    if (error) {
      console.error(error);
    } else {
      setData(data);
    }
  };

  fetchData();

  const locations = data.locations
    ? data.locations.map((location) => location)
    : [];
  const locationsString = locations.join(", ");

  return (
    <div>
      {locations.map((location, index) => (
        <div key={index}>{location}</div>
      ))}
    </div>
  ); // array
};

export default page;
