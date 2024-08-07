"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../utils/supabase/supabase";

const dragConstraints = { top: 0, bottom: 0, right: 0, left: 0 };

const variants = {
  initial: { opacity: 1 },
  drag: { opacity: 0.7 },
};

async function getData() {
  const { data, error } = await supabase.from("routes").select(`*`);

  if (error) {
    console.error("Error fetching data:", error);
    return [];
  }

  return data.filter((item) => item.status !== "assigned");
}

export default function TableCustomers() {
  const [data, setData] = useState([]);
  const rowHeight = 50; // Adjust based on your row height

  useEffect(() => {
    const fetchData = async () => {
      const fetchedData = await getData();
      setData(fetchedData);
    };
    fetchData();
  }, []);

  const handleDragEnd = async (event, info, draggedIndex) => {
    const targetIndex = Math.round(info.point.y / rowHeight);

    if (draggedIndex !== targetIndex) {
      const updatedData = [...data];
      const [draggedItem] = updatedData.splice(draggedIndex, 1);
      updatedData.splice(targetIndex, 0, draggedItem);

      // Update "order" values based on new position
      updatedData.forEach((item, index) => {
        item.order = index;
      });

      // Update "afterTo" values based on new position
      updatedData.forEach((item, index) => {
        if (index === updatedData.length - 1) {
          item.afterTo = "Return store";
        } else {
          item.afterTo = updatedData[index + 1].start;
        }
      });

      try {
        await Promise.all(
          updatedData.map((item) =>
            supabase
              .from("routes")
              .update({ order: item.order, afterTo: item.afterTo })
              .eq("id", item.id)
          )
        );
        setData(updatedData);
      } catch (error) {
        console.error("Error updating order and afterTo:", error);
      }
    }
  };

  const updateRoutesWithDistanceAndTime = async () => {
    const origins = data.map((item) => item.start);
    const destinations = [...origins.slice(1), "Return store"];

    const distanceMatrix = await calculateDistanceAndTime(
      origins,
      destinations
    );

    if (distanceMatrix) {
      const updatedData = data.map((item, index) => ({
        ...item,
        distance: distanceMatrix[index].distance.text,
        time: distanceMatrix[index].duration.text,
      }));

      try {
        await Promise.all(
          updatedData.map((item) =>
            supabase
              .from("routes")
              .update({ distance: item.distance, time: item.time })
              .eq("id", item.id)
          )
        );
        setData(updatedData);
      } catch (error) {
        console.error("Error updating distance and time:");
      }
    }
  };

  const handleCreateOrder = async () => {
    try {
      await Promise.all(
        data.map((item) =>
          supabase
            .from("routes")
            .update({ status: "assigned" })
            .eq("id", item.id)
        )
      );
      setStatus("assigned"); // Update local status

      await updateRoutesWithDistanceAndTime();

      // Redirect to the specified URL
      window.location.assign(
        "https://app.appsmith.com/app/createorder-663bd6bc64694d0878426507"
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }

    window.location.href =
      "https://app.appsmith.com/app/createorder-663bd6bc64694d0878426507";
  };

  const handleCancelOrder = async () => {
    try {
      // Delete all rows where status is "pending"
      await supabase.from("routes").delete().eq("status", "pending");

      console.log("All pending orders have been cancelled.");

      // Redirect to the specified URL
      window.location.href =
        "https://app.appsmith.com/app/createorder-663bd6bc64694d0878426507";
    } catch (error) {
      console.error("Error cancelling orders:", error);
    }
  };

  return (
    <div className="p-6">
      <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
        <tbody className="divide-y divide-gray-200 bg-white">
          <AnimatePresence>
            {data.map((item, index) => (
              <motion.tr
                key={item.id}
                drag
                dragConstraints={dragConstraints}
                variants={variants}
                onDragEnd={(event, info) => handleDragEnd(event, info, index)}
                className="hover:bg-gray-100"
              >
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                  {item.start}
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>

      <button
        onClick={handleCreateOrder}
        className="btn-style mx-6 my-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg"
      >
        Create Order
      </button>

      <button
        onClick={handleCancelOrder}
        className="btn-style mx-6 my-6 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow-lg"
      >
        Cancel Whole Order
      </button>
    </div>
  );
}
