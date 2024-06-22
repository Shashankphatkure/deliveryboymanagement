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

      try {
        await Promise.all(
          updatedData.map((item, index) =>
            supabase.from("routes").update({ order: index }).eq("id", item.id)
          )
        );
        setData(updatedData);
      } catch (error) {
        console.error("Error updating order:", error);
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
    <div>
      <table className="min-w-full divide-y divide-gray-300">
        <tbody className="divide-y divide-gray-200 bg-white">
          <AnimatePresence>
            {data.map((item, index) => (
              <motion.tr
                key={item.id}
                drag
                dragConstraints={dragConstraints}
                variants={variants}
                onDragEnd={(event, info) => handleDragEnd(event, info, index)}
              >
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
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
