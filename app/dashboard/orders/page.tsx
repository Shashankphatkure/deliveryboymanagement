import TableOrders from "@/components/lists/tableorders";
import TableOrdersrunning from "@/components/lists/tableordersrunning";
import TableOrdersunassigned from "@/components/lists/tableordersunasigned";
import React from "react";

const page = () => {
  return (
    <main className="py-10 lg:pl-72">
      <div className="px-4 sm:px-6 lg:px-8">
        <TableOrdersunassigned />
      </div>
      <div className="px-4 sm:px-6 lg:px-8 mt-6">
        <TableOrdersrunning />
      </div>
      <div className="px-4 sm:px-6 lg:px-8 mt-6">
        <TableOrders />
      </div>
    </main>
  );
};

export default page;
